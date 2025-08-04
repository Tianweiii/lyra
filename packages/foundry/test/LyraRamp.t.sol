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
        
        lyraRamp = new LyraRamp(address(mockUsdt), address(mockUsdc));
    }

    function testCreateRampRequest() public {
        vm.startPrank(recipient);
        
        uint256 requestId = lyraRamp.createRampRequest(
            "MYR",
            "John Doe",
            100,
            "polygon"
        );
        
        assertEq(requestId, 1);
        
        LyraRamp.RampRequest memory request = lyraRamp.getRampRequest(1);
        assertEq(request.recipient, recipient);
        assertEq(request.currency, "MYR");
        assertEq(request.recipientName, "John Doe");
        assertEq(request.amount, 100);
        assertEq(request.selectedChain, "polygon");
        assertFalse(request.isCompleted);
        
        vm.stopPrank();
    }

    function testCalculateUsdtEquivalent() public {
        uint256 usdtAmount = lyraRamp.calculateUsdtEquivalent(100, "MYR");
        // 100 MYR * 2300 basis points / 10000 = 23 USDT
        assertEq(usdtAmount, 23);
        
        uint256 usdAmount = lyraRamp.calculateUsdtEquivalent(100, "USD");
        // 100 USD * 10000 basis points / 10000 = 100 USDT
        assertEq(usdAmount, 100);
    }

    function testCompleteRampRequest() public {
        // Create a request
        vm.startPrank(recipient);
        uint256 requestId = lyraRamp.createRampRequest(
            "MYR",
            "John Doe",
            100,
            "polygon"
        );
        vm.stopPrank();
        
        // Fund sender with USDT
        mockUsdt.transfer(sender, 1000);
        
        // Approve USDT transfer
        vm.startPrank(sender);
        mockUsdt.approve(address(lyraRamp), 1000);
        
        // Complete the request
        lyraRamp.completeRampRequest(requestId, address(mockUsdt));
        
        // Check that request is completed
        LyraRamp.RampRequest memory request = lyraRamp.getRampRequest(requestId);
        assertTrue(request.isCompleted);
        
        vm.stopPrank();
    }

    function testUpdateRate() public {
        uint256 oldRate = lyraRamp.getRate("MYR").rate;
        
        lyraRamp.updateRate("MYR", 2500); // 1 MYR = 0.25 USDT
        
        uint256 newRate = lyraRamp.getRate("MYR").rate;
        assertEq(newRate, 2500);
        
        // Test new rate calculation
        uint256 usdtAmount = lyraRamp.calculateUsdtEquivalent(100, "MYR");
        assertEq(usdtAmount, 25); // 100 * 2500 / 10000 = 25
    }

    function testGetQRCodeData() public {
        vm.startPrank(recipient);
        
        uint256 requestId = lyraRamp.createRampRequest(
            "MYR",
            "John Doe",
            100,
            "polygon"
        );
        
        string memory qrData = lyraRamp.getQRCodeData(requestId);
        
        // Check that QR data contains expected information
        assertTrue(bytes(qrData).length > 0);
        assertTrue(contains(qrData, "requestId=1"));
        assertTrue(contains(qrData, "currency=MYR"));
        assertTrue(contains(qrData, "amount=100"));
        
        vm.stopPrank();
    }

    function testGetUserRequests() public {
        vm.startPrank(recipient);
        
        lyraRamp.createRampRequest("MYR", "John", 100, "polygon");
        lyraRamp.createRampRequest("USD", "Jane", 200, "arbitrum");
        
        uint256[] memory requests = lyraRamp.getUserRequests(recipient);
        assertEq(requests.length, 2);
        assertEq(requests[0], 1);
        assertEq(requests[1], 2);
        
        vm.stopPrank();
    }

    function test_RevertWhen_CreateRequestWithInvalidCurrency() public {
        vm.startPrank(recipient);
        
        vm.expectRevert("Currency not supported");
        lyraRamp.createRampRequest(
            "INVALID",
            "John Doe",
            100,
            "polygon"
        );
        
        vm.stopPrank();
    }

    function test_RevertWhen_CompleteAlreadyCompletedRequest() public {
        // Create a request
        vm.startPrank(recipient);
        uint256 requestId = lyraRamp.createRampRequest(
            "MYR",
            "John Doe",
            100,
            "polygon"
        );
        vm.stopPrank();
        
        // Fund sender with USDT
        mockUsdt.transfer(sender, 1000);
        
        // Complete the request twice
        vm.startPrank(sender);
        mockUsdt.approve(address(lyraRamp), 1000);
        lyraRamp.completeRampRequest(requestId, address(mockUsdt));
        
        // This should fail
        vm.expectRevert("Request already completed");
        lyraRamp.completeRampRequest(requestId, address(mockUsdt));
        
        vm.stopPrank();
    }

    // Helper function to check if string contains substring
    function contains(string memory _string, string memory _search) internal pure returns (bool) {
        bytes memory stringBytes = bytes(_string);
        bytes memory searchBytes = bytes(_search);
        
        if (searchBytes.length > stringBytes.length) {
            return false;
        }
        
        for (uint i = 0; i <= stringBytes.length - searchBytes.length; i++) {
            bool found = true;
            for (uint j = 0; j < searchBytes.length; j++) {
                if (stringBytes[i + j] != searchBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }
        return false;
    }
} 