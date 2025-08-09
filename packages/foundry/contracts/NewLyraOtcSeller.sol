// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20, IERC20 as IERC20Safe} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * Lyra OTC (updated):
 * - Governments can fund recipients by swapping USDT -> LYRA or Native -> LYRA.
 * - After government funding, the contract pays 0.1% (1/1000) of the transaction amount
 *   to the recipient as native token to cover gas.
 *
 * Price representation:
 * - priceUsdtPerNative is "USDT (6 decimals) per 1 native (1e18)".
 *   Example: 0.2368 USDT per MATIC -> priceUsdtPerNative = 236_800 (0.2368 * 1e6)
 *
 * - lyraPerUsdt is LYRA(18) per USDT(6). For 1 LYRA == 1 USDT, lyraPerUsdt = 1e12.
 */
contract LyraOtcSeller is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20Safe;

    IERC20 public immutable USDT; // expects 6 decimals
    IERC20 public immutable LYRA; // expects 18 decimals

    // price: USDT (6) per native (1e18) -> stored as uint (example 0.23 USDT => 230_000)
    uint256 public priceUsdtPerNative;

    // LYRA (18) per USDT (6) scaled -> the multiplier to convert USDT(6) -> LYRA(18)
    // Typically lyraPerUsdt = 10**12 when 1 LYRA == 1 USDT
    uint256 public lyraPerUsdt;

    // Fee: numerator / denominator = 0.001 = 0.1%
    uint256 public constant FEE_NUM = 1;
    uint256 public constant FEE_DEN = 1000;

    mapping(address => bool) public isGovernment;
    mapping(address => bool) public isMerchant;

    event GovSwapUsdtSent(address indexed gov, address indexed recipient, uint256 usdtIn, uint256 lyraOut, uint256 nativeFee);
    event GovSwapNativeSent(address indexed gov, address indexed recipient, uint256 nativeIn, uint256 lyraOut, uint256 nativeFee);
    event MerchantSwapLyraToUsdt(address indexed merchant, uint256 lyraIn, uint256 usdtOut);
    event MerchantSwapLyraToNative(address indexed merchant, uint256 lyraIn, uint256 nativeOut);
    event PricesUpdated(uint256 priceUsdtPerNative, uint256 lyraPerUsdt);
    event GovUpdated(address who, bool enabled);
    event MerchantUpdated(address who, bool enabled);

    constructor(
    address _usdt,
    address _lyra,
    uint256 _priceUsdtPerNative, 
    uint256 _lyraPerUsdtHuman,        // e.g. enter 1 in Remix
    address initialOwner
) Ownable(initialOwner) {
    require(_usdt != address(0) && _lyra != address(0), "zero addr");
    USDT = IERC20(_usdt);
    LYRA = IERC20(_lyra);
    priceUsdtPerNative = _priceUsdtPerNative;
    lyraPerUsdt = _lyraPerUsdtHuman * 1e12; // convert USDT(6) to LYRA(18)
}



    // ---------- owner setters ----------
    function setPrices(
    uint256 _priceUsdtPerNative,
    uint256 _lyraPerUsdtHuman
    ) external onlyOwner {
        require(_priceUsdtPerNative > 0 && _lyraPerUsdtHuman > 0, "bad price");
        priceUsdtPerNative = _priceUsdtPerNative;
        lyraPerUsdt = _lyraPerUsdtHuman * 1e12;
        emit PricesUpdated(priceUsdtPerNative, lyraPerUsdt);
    }

    function setGovernment(address who, bool enabled) external onlyOwner {
        isGovernment[who] = enabled;
        emit GovUpdated(who, enabled);
    }

    function setMerchant(address who, bool enabled) external onlyOwner {
        isMerchant[who] = enabled;
        emit MerchantUpdated(who, enabled);
    }

    // ---------- Internal helpers ----------
    /// convert USDT (6) amount -> native (1e18) using priceUsdtPerNative (USDT(6) per 1 native)
    /// returns native amount in wei
    function _usdtToNative(uint256 usdtAmount) internal view returns (uint256) {
        // native = usdtAmount * 1e18 / priceUsdtPerNative
        // Order mul then div to reduce precision loss
        require(priceUsdtPerNative > 0, "native price unset");
        return (usdtAmount * 1e18) / priceUsdtPerNative;
    }

    /// compute native fee given nativeAmount (wei)
    function _nativeFeeFromNativeAmount(uint256 nativeAmount) internal pure returns (uint256) {
        return (nativeAmount * FEE_NUM) / FEE_DEN;
    }

    /// compute native fee given USDT amount (6) -> convert feeUsdt = usdtAmount * fee -> native via price
    function _nativeFeeFromUsdtAmount(uint256 usdtAmount) internal view returns (uint256) {
        uint256 feeUsdt = (usdtAmount * FEE_NUM) / FEE_DEN; // still in USDT (6)
        return _usdtToNative(feeUsdt);
    }

    // ---------- Government: USDT -> LYRA -> send recipient (and pay native fee) ----------
    function govSwapUsdtAndSend(address recipient, uint256 usdtAmount, uint256 minLyraOut) external nonReentrant {
        require(isGovernment[msg.sender], "only government");
        require(usdtAmount > 0, "zero usdt");
        require(recipient != address(0), "zero recipient");

        // LYRA(18) = usdtAmount(6) * lyraPerUsdt
        uint256 lyraOut = usdtAmount * lyraPerUsdt;
        require(lyraOut >= minLyraOut, "slippage");
        require(IERC20(LYRA).balanceOf(address(this)) >= lyraOut, "insufficient lyra in OTC");

        // calculate native fee (converted from 0.1% of USDT amount)
        uint256 nativeFee = _nativeFeeFromUsdtAmount(usdtAmount);

        // ensure contract has native to pay fee
        require(address(this).balance >= nativeFee, "insufficient native for fee");

        // collect USDT from gov (contract retains USDT as backing for cashouts)
        IERC20Safe(address(USDT)).safeTransferFrom(msg.sender, address(this), usdtAmount);

        // send LYRA to recipient
        IERC20Safe(address(LYRA)).safeTransfer(recipient, lyraOut);

        // send native fee to recipient
        if (nativeFee > 0) {
            (bool ok, ) = payable(recipient).call{value: nativeFee}("");
            require(ok, "native fee transfer failed");
        }

        emit GovSwapUsdtSent(msg.sender, recipient, usdtAmount, lyraOut, nativeFee);
    }

    // ---------- Government: native -> LYRA -> send recipient (and pay native fee) ----------
    // Caller sends native (msg.value) and OTC converts to LYRA then sends
    function govSwapNativeAndSend(address recipient, uint256 minLyraOut) external payable nonReentrant {
        require(isGovernment[msg.sender], "only government");
        require(msg.value > 0, "zero native");
        require(recipient != address(0), "zero recipient");
        require(priceUsdtPerNative > 0, "native price unset");

        // Convert native(1e18) to USDT(6): usdtAmount = msg.value * priceUsdtPerNative / 1e18
        uint256 usdtAmount = (msg.value * priceUsdtPerNative) / 1e18;
        require(usdtAmount > 0, "native too small");

        // Convert USDT(6) -> LYRA(18)
        uint256 lyraOut = usdtAmount * lyraPerUsdt;
        require(lyraOut >= minLyraOut, "slippage");
        require(IERC20(LYRA).balanceOf(address(this)) >= lyraOut, "insufficient lyra in OTC");

        // Calculate native fee (0.1% of msg.value)
        uint256 nativeFee = _nativeFeeFromNativeAmount(msg.value);

        // ensure contract has enough native to pay fee (msg.value already added to contract balance at this point)
        require(address(this).balance >= nativeFee, "insufficient native for fee");

        // Send LYRA to recipient
        IERC20Safe(address(LYRA)).safeTransfer(recipient, lyraOut);

        // send native fee to recipient
        if (nativeFee > 0) {
            (bool ok, ) = payable(recipient).call{value: nativeFee}("");
            require(ok, "native fee transfer failed");
        }

        emit GovSwapNativeSent(msg.sender, recipient, msg.value, lyraOut, nativeFee);
    }

    // ---------- Merchant: LYRA -> USDT ----------
    function merchantSwapLyraToUsdt(uint256 lyraAmount, uint256 minUsdtOut) external nonReentrant {
        require(isMerchant[msg.sender], "only merchant");
        require(lyraAmount > 0, "zero lyra");

        // usdtOut(6) = lyraAmount(18) / lyraPerUsdt
        uint256 usdtOut = lyraAmount / lyraPerUsdt;
        require(usdtOut >= minUsdtOut, "slippage");
        require(IERC20(USDT).balanceOf(address(this)) >= usdtOut, "insufficient USDT in OTC");

        // merchant must approve LYRA to this contract
        IERC20Safe(address(LYRA)).safeTransferFrom(msg.sender, address(this), lyraAmount);
        IERC20Safe(address(USDT)).safeTransfer(msg.sender, usdtOut);

        emit MerchantSwapLyraToUsdt(msg.sender, lyraAmount, usdtOut);
    }

    // ---------- Merchant: LYRA -> Native ----------
    function merchantSwapLyraToNative(uint256 lyraAmount, uint256 minNativeOut) external nonReentrant {
        require(isMerchant[msg.sender], "only merchant");
        require(lyraAmount > 0, "zero lyra");
        require(priceUsdtPerNative > 0, "native price unset");

        // usdtOut(6) = lyraAmount(18) / lyraPerUsdt
        uint256 usdtOut = lyraAmount / lyraPerUsdt;
        // nativeOut(1e18) = usdtOut(6) * 1e18 / priceUsdtPerNative
        uint256 nativeOut = (usdtOut * 1e18) / priceUsdtPerNative;
        require(nativeOut >= minNativeOut, "slippage");
        require(address(this).balance >= nativeOut, "insufficient native in OTC");

        // pull LYRA
        IERC20Safe(address(LYRA)).safeTransferFrom(msg.sender, address(this), lyraAmount);

        // send native to merchant
        (bool ok, ) = payable(msg.sender).call{value: nativeOut}("");
        require(ok, "native transfer failed");

        emit MerchantSwapLyraToNative(msg.sender, lyraAmount, nativeOut);
    }

    // ---------- Views ----------
    /// quote: given USDT(6) -> LYRA(18)
    function quoteLyraForUsdt(uint256 usdtAmount) public view returns (uint256) {
        return usdtAmount * lyraPerUsdt;
    }

    /// quote: given native(1e18) -> LYRA(18)
    function quoteLyraForNative(uint256 nativeAmount) public view returns (uint256) {
        uint256 usdtAmount = (nativeAmount * priceUsdtPerNative) / 1e18;
        return usdtAmount * lyraPerUsdt;
    }

    /// quote: given LYRA(18) -> USDT(6)
    function quoteUsdtForLyra(uint256 lyraAmount) public view returns (uint256) {
        return lyraAmount / lyraPerUsdt;
    }

    /// quote: given LYRA(18) -> native(1e18)
    function quoteNativeForLyra(uint256 lyraAmount) public view returns (uint256) {
        uint256 usdtAmount = lyraAmount / lyraPerUsdt;
        return (usdtAmount * 1e18) / priceUsdtPerNative;
    }

    // ---------- Admin withdraw ----------
    /// owner may withdraw tokens/native (emergency / collected backing funds)
    function withdraw(address token, uint256 amount, address payable to) external onlyOwner {
        require(to != address(0), "zero recipient");
        if (token == address(0)) {
            // native
            (bool ok, ) = to.call{value: amount}("");
            require(ok, "native withdraw failed");
        } else {
            IERC20Safe(token).safeTransfer(to, amount);
        }
    }

    receive() external payable {}
    fallback() external payable {}
}
