// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LyraOtcSeller is Ownable, ReentrancyGuard {
    IERC20 public immutable USDT;
    IERC20 public immutable LYRA;

    // 1 LYRA = 1 USDT (6 decimals)
    uint256 public constant PRICE_USDT_PER_LYRA = 1_000_000; // 1 USDT = 1 LYRA (6 decimals)
    
    // 1 MATIC = 0.23 USDT (6 decimals) - Updated for Polygon mainnet
    uint256 public priceUsdtPerNative = 230_000; // 0.23 USDT per MATIC

    // Fee percentage: 0.1% of transaction amount in MATIC for gas fees
    uint256 public constant FEE_PERCENTAGE = 1; // 0.1% = 1/1000

    event BoughtWithUSDT(address indexed buyer, address indexed recipient, uint256 usdtIn, uint256 lyraOut, uint256 maticFee);
    event BoughtWithNative(address indexed buyer, address indexed recipient, uint256 nativeIn, uint256 lyraOut, uint256 maticFee);
    event Withdraw(address token, uint256 amount);
    event PriceUpdated(uint256 newPrice);

    constructor(address _usdt, address _lyra, address initialOwner) Ownable(initialOwner) {
        require(_usdt != address(0) && _lyra != address(0), "zero addr");
        USDT = IERC20(_usdt);
        LYRA = IERC20(_lyra);
    }

    function setPriceUsdtPerNative(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "bad price");
        priceUsdtPerNative = newPrice;
        emit PriceUpdated(newPrice);
    }

    // Use USDT to purchase LYRA and send to recipient
    function buyWithUSDTForRecipient(uint256 usdtAmountIn, address recipient, uint256 minLyraOut) external nonReentrant {
        require(usdtAmountIn > 0, "zero amount");
        require(recipient != address(0), "zero recipient");

        // Calculate LYRA amount: usdtAmountIn / 1 (1 LYRA = 1 USDT)
        // Convert from USDT decimals (6) to LYRA decimals (18)
        uint256 lyraOut = usdtAmountIn * 10**12; // 6 to 18 decimals
        require(lyraOut >= minLyraOut, "slippage");

        require(LYRA.balanceOf(address(this)) >= lyraOut, "insufficient LYRA");

        // Calculate MATIC fee: 0.1% of usdtAmountIn
        uint256 maticFee = (usdtAmountIn * FEE_PERCENTAGE) / 1000;
        
        // Check if contract has enough MATIC for fee
        require(address(this).balance >= maticFee, "insufficient MATIC for fee");

        // Receive USDT, send LYRA to recipient, and send MATIC fee
        require(USDT.transferFrom(msg.sender, address(this), usdtAmountIn), "usdt transferFrom fail");
        require(LYRA.transfer(recipient, lyraOut), "lyra transfer fail");
        
        // Send MATIC fee to recipient for gas fees
        (bool success, ) = recipient.call{value: maticFee}("");
        require(success, "matic fee transfer failed");

        emit BoughtWithUSDT(msg.sender, recipient, usdtAmountIn, lyraOut, maticFee);
    }

    // Use MATIC to buy LYRA and send to recipient
    function buyWithNativeForRecipient(address recipient, uint256 minLyraOut) external payable nonReentrant {
        require(msg.value > 0, "no value");
        require(recipient != address(0), "zero recipient");
        require(priceUsdtPerNative > 0, "native price unset");

        // Convert native to USDT amount (6 decimals)
        // msg.value(18) * priceUsdtPerNative(6) / 1e18 => usdtAmount(6)
        uint256 usdtAmount = (msg.value * priceUsdtPerNative) / 1e18;

        // Calculate LYRA amount at 1:1 ratio, convert to LYRA decimals (18)
        uint256 lyraOut = usdtAmount * 10**12; // 6 to 18 decimals
        require(lyraOut >= minLyraOut, "slippage");
        require(LYRA.balanceOf(address(this)) >= lyraOut, "insufficient LYRA");

        // Calculate MATIC fee: 0.1% of msg.value
        uint256 maticFee = (msg.value * FEE_PERCENTAGE) / 1000;
        
        // Check if contract has enough MATIC for fee (should have received msg.value)
        require(address(this).balance >= maticFee, "insufficient MATIC for fee");

        // Send LYRA to recipient and MATIC fee
        require(LYRA.transfer(recipient, lyraOut), "lyra transfer fail");
        
        // Send MATIC fee to recipient for gas fees
        (bool success, ) = recipient.call{value: maticFee}("");
        require(success, "matic fee transfer failed");

        emit BoughtWithNative(msg.sender, recipient, msg.value, lyraOut, maticFee);
    }

    // Get quote for USDT
    function getQuoteUsdt(uint256 usdtAmountIn) external pure returns (uint256 lyraOut) {
        return usdtAmountIn * 10**12; // Convert from 6 to 18 decimals
    }

    // Get quote for native token
    function getQuoteNative(uint256 nativeAmountIn) external view returns (uint256 lyraOut) {
        uint256 usdtAmount = (nativeAmountIn * priceUsdtPerNative) / 1e18;
        return usdtAmount * 10**12; // Convert from 6 to 18 decimals
    }

    // Get native token price
    function getNativePrice() external view returns (uint256) {
        return priceUsdtPerNative;
    }

    // Get MATIC fee amount for a given transaction amount
    function getMaticFee(uint256 transactionAmount) external pure returns (uint256) {
        return (transactionAmount * FEE_PERCENTAGE) / 1000;
    }

    // Withdraw (owner withdraws collected USDT / native tokens / remaining LYRA)
    function withdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool ok, ) = owner().call{value: amount}("");
            require(ok, "native withdraw fail");
        } else {
            require(IERC20(token).transfer(owner(), amount), "token withdraw fail");
        }
        emit Withdraw(token, amount);
    }

    // Check contract balance
    function getBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }

    receive() external payable {}
} 