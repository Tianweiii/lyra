// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {LyraOtcSeller} from "../contracts/NewLyraOtcSeller.sol";
import {LyraToken} from "../contracts/NewLyraToken.sol";
import {MockUSDT} from "./mocks/MockUSDT.sol";

contract NewLyraOtcSellerTest is Test {
    LyraOtcSeller public otcSeller;
    LyraToken public lyra;
    MockUSDT public usdt;
    
    address public owner;
    address public government;
    address public merchant;
    address public recipient;

    function setUp() public {
        owner = makeAddr("owner");
        government = makeAddr("government");
        merchant = makeAddr("merchant");
        recipient = makeAddr("recipient");

        // Deploy mock tokens
        usdt = new MockUSDT();
        lyra = new LyraToken(owner, 1000 * 10**18); // 1000 LYRA

        // Deploy OTC seller with initial prices
        uint256 priceUsdtPerNative = 230_000; // 0.23 USDT per MATIC
        uint256 lyraPerUsdtHuman = 1; // 1 LYRA = 1 USDT (human readable)
        vm.prank(owner);
        otcSeller = new LyraOtcSeller(address(usdt), address(lyra), priceUsdtPerNative, lyraPerUsdtHuman, owner);

        // Set up roles in LyraToken
        vm.prank(owner);
        lyra.setGovernment(owner, true);
        vm.prank(owner);
        lyra.setMerchant(address(otcSeller), true);

        // Fund the OTC seller with LYRA (owner can transfer to OTC)
        vm.prank(owner);
        lyra.transfer(address(otcSeller), 500 * 10**18); // 500 LYRA

        // Fund the OTC seller with USDT
        usdt.mint(address(otcSeller), 1000 * 10**6); // 1000 USDT

        // Fund the OTC seller with MATIC
        vm.deal(address(otcSeller), 100 * 10**18); // 100 MATIC

        // Set up roles in OTC
        vm.prank(owner);
        otcSeller.setGovernment(government, true);
        vm.prank(owner);
        otcSeller.setMerchant(merchant, true);

        // Fund test accounts
        usdt.mint(government, 1000 * 10**6); // 1000 USDT
        vm.deal(government, 10 * 10**18); // 10 MATIC
        
        // Fund merchant with LYRA (owner can transfer to merchant)
        vm.prank(owner);
        lyra.transfer(merchant, 100 * 10**18); // 100 LYRA
    }

    function test_Constructor() public view {
        assertEq(address(otcSeller.USDT()), address(usdt));
        assertEq(address(otcSeller.LYRA()), address(lyra));
        assertEq(otcSeller.owner(), owner);
        assertEq(otcSeller.priceUsdtPerNative(), 230_000);
        assertEq(otcSeller.lyraPerUsdt(), 1 * 10**12); // 1 * 1e12 = 1e12
    }

    function test_GovSwapUsdtAndSend() public {
        uint256 usdtAmount = 100 * 10**6; // 100 USDT
        uint256 expectedLyra = 100 * 10**18; // 100 LYRA
        uint256 minLyraOut = expectedLyra * 99 / 100; // 1% slippage

        // Approve USDT
        vm.prank(government);
        usdt.approve(address(otcSeller), usdtAmount);

        // Check initial balances
        uint256 govUsdtBefore = usdt.balanceOf(government);
        uint256 recipientLyraBefore = lyra.balanceOf(recipient);
        uint256 contractUsdtBefore = usdt.balanceOf(address(otcSeller));
        uint256 contractLyraBefore = lyra.balanceOf(address(otcSeller));

        // Execute swap
        vm.prank(government);
        otcSeller.govSwapUsdtAndSend(recipient, usdtAmount, minLyraOut);

        // Check final balances
        assertEq(usdt.balanceOf(government), govUsdtBefore - usdtAmount);
        assertEq(lyra.balanceOf(recipient), recipientLyraBefore + expectedLyra);
        assertEq(usdt.balanceOf(address(otcSeller)), contractUsdtBefore + usdtAmount);
        assertEq(lyra.balanceOf(address(otcSeller)), contractLyraBefore - expectedLyra);
    }

    function test_GovSwapNativeAndSend() public {
        uint256 nativeAmount = 1 * 10**18; // 1 MATIC
        uint256 expectedLyra = 0.23 * 10**18; // 0.23 LYRA
        uint256 minLyraOut = expectedLyra * 99 / 100; // 1% slippage

        // Check initial balances
        uint256 recipientLyraBefore = lyra.balanceOf(recipient);
        uint256 contractNativeBefore = address(otcSeller).balance;
        uint256 contractLyraBefore = lyra.balanceOf(address(otcSeller));

        // Execute swap
        vm.prank(government);
        otcSeller.govSwapNativeAndSend{value: nativeAmount}(recipient, minLyraOut);

        // Check final balances
        assertEq(lyra.balanceOf(recipient), recipientLyraBefore + expectedLyra);
        assertEq(address(otcSeller).balance, contractNativeBefore + nativeAmount);
        assertEq(lyra.balanceOf(address(otcSeller)), contractLyraBefore - expectedLyra);
    }

    function test_MerchantSwapLyraToUsdt() public {
        uint256 lyraAmount = 100 * 10**18; // 100 LYRA
        uint256 expectedUsdt = 100 * 10**6; // 100 USDT
        uint256 minUsdtOut = expectedUsdt * 99 / 100; // 1% slippage

        // Approve LYRA
        vm.prank(merchant);
        lyra.approve(address(otcSeller), lyraAmount);

        // Check initial balances
        uint256 merchantLyraBefore = lyra.balanceOf(merchant);
        uint256 merchantUsdtBefore = usdt.balanceOf(merchant);
        uint256 contractLyraBefore = lyra.balanceOf(address(otcSeller));
        uint256 contractUsdtBefore = usdt.balanceOf(address(otcSeller));

        // Execute swap
        vm.prank(merchant);
        otcSeller.merchantSwapLyraToUsdt(lyraAmount, minUsdtOut);

        // Check final balances
        assertEq(lyra.balanceOf(merchant), merchantLyraBefore - lyraAmount);
        assertEq(usdt.balanceOf(merchant), merchantUsdtBefore + expectedUsdt);
        assertEq(lyra.balanceOf(address(otcSeller)), contractLyraBefore + lyraAmount);
        assertEq(usdt.balanceOf(address(otcSeller)), contractUsdtBefore - expectedUsdt);
    }

    function test_MerchantSwapLyraToNative() public {
        uint256 lyraAmount = 100 * 10**18; // 100 LYRA
        uint256 expectedNative = 434782608695652173; // ~0.435 MATIC (100/0.23)
        uint256 minNativeOut = expectedNative * 99 / 100; // 1% slippage

        // Approve LYRA
        vm.prank(merchant);
        lyra.approve(address(otcSeller), lyraAmount);

        // Check initial balances
        uint256 merchantLyraBefore = lyra.balanceOf(merchant);
        uint256 merchantNativeBefore = merchant.balance;
        uint256 contractLyraBefore = lyra.balanceOf(address(otcSeller));
        uint256 contractNativeBefore = address(otcSeller).balance;

        // Execute swap
        vm.prank(merchant);
        otcSeller.merchantSwapLyraToNative(lyraAmount, minNativeOut);

        // Check final balances
        assertEq(lyra.balanceOf(merchant), merchantLyraBefore - lyraAmount);
        assertEq(merchant.balance, merchantNativeBefore + expectedNative);
        assertEq(lyra.balanceOf(address(otcSeller)), contractLyraBefore + lyraAmount);
        assertEq(address(otcSeller).balance, contractNativeBefore - expectedNative);
    }

    function test_RevertWhen_NonGovernmentCallsGovFunction() public {
        uint256 usdtAmount = 100 * 10**6;
        uint256 minLyraOut = 100 * 10**18;

        vm.prank(merchant);
        usdt.approve(address(otcSeller), usdtAmount);

        vm.prank(merchant);
        vm.expectRevert("only government");
        otcSeller.govSwapUsdtAndSend(recipient, usdtAmount, minLyraOut);
    }

    function test_RevertWhen_NonMerchantCallsMerchantFunction() public {
        uint256 lyraAmount = 100 * 10**18;
        uint256 minUsdtOut = 100 * 10**6;

        vm.prank(government);
        lyra.approve(address(otcSeller), lyraAmount);

        vm.prank(government);
        vm.expectRevert("only merchant");
        otcSeller.merchantSwapLyraToUsdt(lyraAmount, minUsdtOut);
    }

    function test_QuoteFunctions() public view {
        uint256 usdtAmount = 100 * 10**6; // 100 USDT
        uint256 nativeAmount = 1 * 10**18; // 1 MATIC
        uint256 lyraAmount = 100 * 10**18; // 100 LYRA

        // Test quotes
        assertEq(otcSeller.quoteLyraForUsdt(usdtAmount), 100 * 10**18); // 100 LYRA
        assertEq(otcSeller.quoteLyraForNative(nativeAmount), 0.23 * 10**18); // 0.23 LYRA
        assertEq(otcSeller.quoteUsdtForLyra(lyraAmount), 100 * 10**6); // 100 USDT
        assertEq(otcSeller.quoteNativeForLyra(lyraAmount), 434782608695652173); // ~0.435 MATIC
    }

    function test_SetPrices() public {
        uint256 newPriceUsdtPerNative = 250_000; // 0.25 USDT per MATIC
        uint256 newLyraPerUsdtHuman = 2; // 2 LYRA per USDT

        vm.prank(owner);
        otcSeller.setPrices(newPriceUsdtPerNative, newLyraPerUsdtHuman);

        assertEq(otcSeller.priceUsdtPerNative(), newPriceUsdtPerNative);
        assertEq(otcSeller.lyraPerUsdt(), newLyraPerUsdtHuman * 10**12);
    }

    function test_RevertWhen_NonOwnerSetsPrices() public {
        uint256 newPriceUsdtPerNative = 250_000;
        uint256 newLyraPerUsdtHuman = 2;

        vm.prank(merchant);
        vm.expectRevert();
        otcSeller.setPrices(newPriceUsdtPerNative, newLyraPerUsdtHuman);
    }
} 