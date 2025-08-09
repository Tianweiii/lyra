// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {LyraOtcSeller} from "../contracts/LyraOtcSeller.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract LyraOtcSellerTest is Test {
    LyraOtcSeller public otcSeller;
    MockERC20 public usdt;
    MockERC20 public lyra;
    address public owner;
    address public buyer;
    address public recipient;

    function setUp() public {
        owner = makeAddr("owner");
        buyer = makeAddr("buyer");
        recipient = makeAddr("recipient");

        // Deploy mock tokens
        usdt = new MockERC20("USDT", "USDT", 6);
        lyra = new MockERC20("LYRA", "LYRA", 18);

        // Deploy OTC seller
        vm.prank(owner);
        otcSeller = new LyraOtcSeller(address(usdt), address(lyra), owner);

        // Fund the OTC seller with LYRA and POL
        lyra.mint(address(otcSeller), 1000 * 10**18); // 1000 LYRA
        vm.deal(address(otcSeller), 100 * 10**18); // 100 POL

        // Fund buyer with USDT and POL
        usdt.mint(buyer, 1000 * 10**6); // 1000 USDT
        vm.deal(buyer, 10 * 10**18); // 10 POL
    }

    function test_Constructor() public view {
        assertEq(address(otcSeller.USDT()), address(usdt));
        assertEq(address(otcSeller.LYRA()), address(lyra));
        assertEq(otcSeller.owner(), owner);
        assertEq(otcSeller.PRICE_USDT_PER_LYRA(), 1_000_000); // 1:1 ratio
        assertEq(otcSeller.priceUsdtPerNative(), 230_000); // 0.23 USDT per POL
        assertEq(otcSeller.FEE_PERCENTAGE(), 1); // 0.1%
    }

    function test_GetQuoteUsdt() public view {
        uint256 usdtAmount = 100 * 10**6; // 100 USDT
        uint256 expectedLyra = 100 * 10**18; // 100 LYRA (1:1 ratio, converted to 18 decimals)
        
        uint256 quote = otcSeller.getQuoteUsdt(usdtAmount);
        assertEq(quote, expectedLyra);
    }

    function test_GetQuoteNative() public view {
        uint256 nativeAmount = 1 * 10**18; // 1 POL
        uint256 expectedLyra = 0.23 * 10**18; // 0.23 LYRA (1 POL = 0.23 USDT = 0.23 LYRA, 18 decimals)
        
        uint256 quote = otcSeller.getQuoteNative(nativeAmount);
        assertEq(quote, expectedLyra);
    }

    function test_GetPolFee() public view {
        uint256 transactionAmount = 1000 * 10**6; // 1000 USDT
        uint256 expectedFee = 1 * 10**6; // 1 USDT (0.1% of 1000)
        
        uint256 fee = otcSeller.getMaticFee(transactionAmount);
        assertEq(fee, expectedFee);
    }

    function test_BuyWithUSDTForRecipient() public {
        uint256 usdtAmount = 100 * 10**6; // 100 USDT
        uint256 expectedLyra = 100 * 10**18; // 100 LYRA (18 decimals)
        uint256 expectedMaticFee = 0.1 * 10**6; // 0.1 MATIC (0.1% of 100 USDT)
        uint256 minLyraOut = expectedLyra * 99 / 100; // 1% slippage

        // Approve USDT
        vm.prank(buyer);
        usdt.approve(address(otcSeller), usdtAmount);

        // Check initial balances
        uint256 buyerUsdtBefore = usdt.balanceOf(buyer);
        uint256 recipientLyraBefore = lyra.balanceOf(recipient);
        uint256 recipientMaticBefore = recipient.balance;
        uint256 contractUsdtBefore = usdt.balanceOf(address(otcSeller));
        uint256 contractLyraBefore = lyra.balanceOf(address(otcSeller));
        uint256 contractMaticBefore = address(otcSeller).balance;

        // Execute purchase
        vm.prank(buyer);
        otcSeller.buyWithUSDTForRecipient(usdtAmount, recipient, minLyraOut);

        // Check final balances
        assertEq(usdt.balanceOf(buyer), buyerUsdtBefore - usdtAmount);
        assertEq(lyra.balanceOf(recipient), recipientLyraBefore + expectedLyra);
        assertEq(recipient.balance, recipientMaticBefore + expectedMaticFee);
        assertEq(usdt.balanceOf(address(otcSeller)), contractUsdtBefore + usdtAmount);
        assertEq(lyra.balanceOf(address(otcSeller)), contractLyraBefore - expectedLyra);
        assertEq(address(otcSeller).balance, contractMaticBefore - expectedMaticFee);
    }

    function test_BuyWithNativeForRecipient() public {
        uint256 nativeAmount = 1 * 10**18; // 1 MATIC
        uint256 expectedLyra = 0.23 * 10**18; // 0.23 LYRA (18 decimals)
        uint256 expectedMaticFee = 0.001 * 10**18; // 0.001 MATIC (0.1% of 1 MATIC)
        uint256 minLyraOut = expectedLyra * 99 / 100; // 1% slippage

        // Check initial balances
        uint256 recipientLyraBefore = lyra.balanceOf(recipient);
        uint256 recipientMaticBefore = recipient.balance;
        uint256 contractNativeBefore = address(otcSeller).balance;
        uint256 contractLyraBefore = lyra.balanceOf(address(otcSeller));

        // Execute purchase
        vm.prank(buyer);
        otcSeller.buyWithNativeForRecipient{value: nativeAmount}(recipient, minLyraOut);

        // Check final balances
        assertEq(lyra.balanceOf(recipient), recipientLyraBefore + expectedLyra);
        assertEq(recipient.balance, recipientMaticBefore + expectedMaticFee);
        assertEq(address(otcSeller).balance, contractNativeBefore + nativeAmount - expectedMaticFee);
        assertEq(lyra.balanceOf(address(otcSeller)), contractLyraBefore - expectedLyra);
    }

    function test_RevertWhen_InsufficientMaticForFee() public {
        uint256 usdtAmount = 100 * 10**6; // 100 USDT
        uint256 minLyraOut = 100 * 10**18;

        // Drain contract's MATIC balance
        vm.prank(owner);
        otcSeller.withdraw(address(0), address(otcSeller).balance);

        vm.prank(buyer);
        usdt.approve(address(otcSeller), usdtAmount);

        vm.prank(buyer);
        vm.expectRevert("insufficient MATIC for fee");
        otcSeller.buyWithUSDTForRecipient(usdtAmount, recipient, minLyraOut);
    }

    function test_RevertWhen_SlippageExceeded() public {
        uint256 usdtAmount = 100 * 10**6; // 100 USDT
        uint256 expectedLyra = 100 * 10**18; // 100 LYRA (18 decimals)
        uint256 minLyraOut = expectedLyra + 1; // Expect more than 1:1 ratio

        vm.prank(buyer);
        usdt.approve(address(otcSeller), usdtAmount);

        vm.prank(buyer);
        vm.expectRevert("slippage");
        otcSeller.buyWithUSDTForRecipient(usdtAmount, recipient, minLyraOut);
    }

    function test_RevertWhen_ZeroRecipient() public {
        uint256 usdtAmount = 100 * 10**6;

        vm.prank(buyer);
        usdt.approve(address(otcSeller), usdtAmount);

        vm.prank(buyer);
        vm.expectRevert("zero recipient");
        otcSeller.buyWithUSDTForRecipient(usdtAmount, address(0), 0);
    }

    function test_SetPriceUsdtPerNative() public {
        uint256 newPrice = 250_000; // 0.25 USDT per POL

        vm.prank(owner);
        otcSeller.setPriceUsdtPerNative(newPrice);

        assertEq(otcSeller.priceUsdtPerNative(), newPrice);
    }

    function test_RevertWhen_NonOwnerSetsPrice() public {
        uint256 newPrice = 250_000;

        vm.prank(buyer);
        vm.expectRevert();
        otcSeller.setPriceUsdtPerNative(newPrice);
    }

    function test_Withdraw() public {
        uint256 withdrawAmount = 100 * 10**6;

        // Fund contract with USDT
        usdt.mint(address(otcSeller), withdrawAmount);

        uint256 ownerBalanceBefore = usdt.balanceOf(owner);

        vm.prank(owner);
        otcSeller.withdraw(address(usdt), withdrawAmount);

        assertEq(usdt.balanceOf(owner), ownerBalanceBefore + withdrawAmount);
    }

    function test_GetBalance() public view {
        uint256 usdtBalance = otcSeller.getBalance(address(usdt));
        uint256 lyraBalance = otcSeller.getBalance(address(lyra));
        uint256 nativeBalance = otcSeller.getBalance(address(0));

        assertEq(usdtBalance, usdt.balanceOf(address(otcSeller)));
        assertEq(lyraBalance, lyra.balanceOf(address(otcSeller)));
        assertEq(nativeBalance, address(otcSeller).balance);
    }
} 