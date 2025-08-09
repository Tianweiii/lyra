// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/LyraRamp.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 token for testing
contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}

contract LyraRampTest is Test {
    LyraRamp public lyraRamp;
    MockUSDT public mockUsdt;
    MockUSDC public mockUsdc;
    
    address public owner;
    address public recipient;
    address public sender;

    function setUp() public {
        owner = address(this);
        recipient = makeAddr("recipient");
        sender = makeAddr("sender");
        
        mockUsdt = new MockUSDT();
        mockUsdc = new MockUSDC();
        
        lyraRamp = new LyraRamp();
        
        // Add supported stablecoins
        lyraRamp.addSupportedStablecoin(address(mockUsdt));
        lyraRamp.addSupportedStablecoin(address(mockUsdc));
    }

    function testCompletePayment() public {
        // Fund sender with USDT
        mockUsdt.transfer(sender, 1000 * 10**6); // 1000 USDT with 6 decimals
        
        // Approve USDT transfer
        vm.startPrank(sender);
        mockUsdt.approve(address(lyraRamp), 1000 * 10**6);
        
        // Complete payment
        lyraRamp.completePayment(
            recipient,
            "MYR",
            "John Doe",
            100, // fiat amount
            23 * 10**6, // stablecoin amount (23 USDT with 6 decimals)
            "polygon",
            "scroll",
            address(mockUsdt)
        );
        
        // Check that payment is recorded
        LyraRamp.Payment memory payment = lyraRamp.getPayment(1);
        assertEq(payment.recipient, recipient);
        assertEq(payment.currency, "MYR");
        assertEq(payment.recipientName, "John Doe");
        assertEq(payment.amount, 100);
        assertEq(payment.stablecoinAmount, 23 * 10**6);
        assertEq(payment.sourceChain, "polygon");
        assertEq(payment.targetChain, "scroll");
        assertTrue(payment.isCompleted);
        assertEq(payment.sender, sender);
        assertEq(payment.stablecoinToken, address(mockUsdt));
        
        vm.stopPrank();
    }

    function testAddSupportedStablecoin() public {
        address newToken = makeAddr("newToken");
        
        lyraRamp.addSupportedStablecoin(newToken);
        
        assertTrue(lyraRamp.isStablecoinSupported(newToken));
    }

    function testRemoveSupportedStablecoin() public {
        address tokenToRemove = address(mockUsdt);
        
        lyraRamp.removeSupportedStablecoin(tokenToRemove);
        
        assertFalse(lyraRamp.isStablecoinSupported(tokenToRemove));
    }

    function testUpdateFeePercentage() public {
        uint256 newFee = 100; // 1%
        
        lyraRamp.updateFeePercentage(newFee);
        
        assertEq(lyraRamp.feePercentage(), newFee);
    }

    function test_RevertWhen_CompletePaymentWithInvalidRecipient() public {
        vm.startPrank(sender);
        
        vm.expectRevert("Invalid recipient address");
        lyraRamp.completePayment(
            address(0),
            "MYR",
            "John Doe",
            100,
            23 * 10**6,
            "polygon",
            "scroll",
            address(mockUsdt)
        );
        
        vm.stopPrank();
    }

    function test_RevertWhen_CompletePaymentWithUnsupportedStablecoin() public {
        address unsupportedToken = makeAddr("unsupportedToken");
        
        vm.startPrank(sender);
        
        vm.expectRevert("Stablecoin not supported");
        lyraRamp.completePayment(
            recipient,
            "MYR",
            "John Doe",
            100,
            23 * 10**6,
            "polygon",
            "scroll",
            unsupportedToken
        );
        
        vm.stopPrank();
    }

    function test_RevertWhen_CompletePaymentWithZeroAmount() public {
        vm.startPrank(sender);
        
        vm.expectRevert("Amount must be greater than 0");
        lyraRamp.completePayment(
            recipient,
            "MYR",
            "John Doe",
            0,
            23 * 10**6,
            "polygon",
            "scroll",
            address(mockUsdt)
        );
        
        vm.stopPrank();
    }

    function test_RevertWhen_CompletePaymentWithZeroStablecoinAmount() public {
        vm.startPrank(sender);
        
        vm.expectRevert("Stablecoin amount must be greater than 0");
        lyraRamp.completePayment(
            recipient,
            "MYR",
            "John Doe",
            100,
            0,
            "polygon",
            "scroll",
            address(mockUsdt)
        );
        
        vm.stopPrank();
    }

    function testGetUserPayments() public {
        // Complete a payment
        mockUsdt.transfer(sender, 1000 * 10**6); // 1000 USDT with 6 decimals
        vm.startPrank(sender);
        mockUsdt.approve(address(lyraRamp), 1000 * 10**6);
        
        lyraRamp.completePayment(
            recipient,
            "MYR",
            "John Doe",
            100,
            23 * 10**6,
            "polygon",
            "scroll",
            address(mockUsdt)
        );
        
        vm.stopPrank();
        
        // Check user payments
        uint256[] memory recipientPayments = lyraRamp.getUserPayments(recipient);
        uint256[] memory senderPayments = lyraRamp.getUserPayments(sender);
        
        assertEq(recipientPayments.length, 1);
        assertEq(senderPayments.length, 1);
        assertEq(recipientPayments[0], 1);
        assertEq(senderPayments[0], 1);
    }

    function testPaymentCounter() public {
        assertEq(lyraRamp.paymentCounter(), 0);
        
        // Complete a payment
        mockUsdt.transfer(sender, 1000 * 10**6); // 1000 USDT with 6 decimals
        vm.startPrank(sender);
        mockUsdt.approve(address(lyraRamp), 1000 * 10**6);
        
        lyraRamp.completePayment(
            recipient,
            "MYR",
            "John Doe",
            100,
            23 * 10**6,
            "polygon",
            "scroll",
            address(mockUsdt)
        );
        
        vm.stopPrank();
        
        assertEq(lyraRamp.paymentCounter(), 1);
    }
} 