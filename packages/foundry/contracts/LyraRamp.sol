// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title LyraRamp
 * @dev On/Off ramp service for converting tokens to fiat and vice versa
 */
contract LyraRamp is ReentrancyGuard, Ownable {
    using Strings for uint256;

    // Structs
    struct RampRequest {
        address recipient;
        string currency;
        string recipientName;
        uint256 amount;
        uint256 usdtEquivalent;
        uint256 requestId;
        bool isCompleted;
        uint256 timestamp;
        string selectedChain;
    }

    struct Rate {
        uint256 rate; // Rate in basis points (1 MYR = 0.23 USDT = 2300 basis points)
        bool isActive;
        uint256 lastUpdated;
    }

    // State Variables
    mapping(uint256 => RampRequest) public rampRequests;
    mapping(string => Rate) public rates; // currency => rate
    mapping(address => uint256[]) public userRequests;
    
    uint256 public requestCounter;
    uint256 public feePercentage = 50; // 0.5% fee in basis points
    address public usdtToken;
    address public usdcToken;
    
    // Events
    event RampRequestCreated(
        uint256 indexed requestId,
        address indexed recipient,
        string currency,
        string recipientName,
        uint256 amount,
        uint256 usdtEquivalent,
        string selectedChain,
        uint256 timestamp
    );
    
    event RampRequestCompleted(
        uint256 indexed requestId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        string currency,
        uint256 usdtAmount,
        string selectedChain,
        uint256 timestamp
    );
    
    event RateUpdated(
        string currency,
        uint256 oldRate,
        uint256 newRate,
        uint256 timestamp
    );
    
    event FeeCollected(
        uint256 indexed requestId,
        uint256 feeAmount,
        address token,
        uint256 timestamp
    );

    // Constructor
    constructor(address _usdtToken, address _usdcToken) Ownable(msg.sender) {
        usdtToken = _usdtToken;
        usdcToken = _usdcToken;
        
        // Initialize some default rates
        rates["MYR"] = Rate(2300, true, block.timestamp); // 1 MYR = 0.23 USDT
        rates["USD"] = Rate(10000, true, block.timestamp); // 1 USD = 1 USDT
        rates["SGD"] = Rate(7500, true, block.timestamp);  // 1 SGD = 0.75 USDT
    }

    /**
     * @dev Create a new ramp request
     * @param _currency The fiat currency code (e.g., "MYR")
     * @param _recipientName Name of the recipient
     * @param _amount Amount in fiat currency
     * @param _selectedChain The blockchain to use for the transaction
     */
    function createRampRequest(
        string memory _currency,
        string memory _recipientName,
        uint256 _amount,
        string memory _selectedChain
    ) external returns (uint256) {
        require(bytes(_currency).length > 0, "Currency cannot be empty");
        require(bytes(_recipientName).length > 0, "Recipient name cannot be empty");
        require(_amount > 0, "Amount must be greater than 0");
        require(rates[_currency].isActive, "Currency not supported");
        
        requestCounter++;
        uint256 usdtEquivalent = calculateUsdtEquivalent(_amount, _currency);
        
        RampRequest memory newRequest = RampRequest({
            recipient: msg.sender,
            currency: _currency,
            recipientName: _recipientName,
            amount: _amount,
            usdtEquivalent: usdtEquivalent,
            requestId: requestCounter,
            isCompleted: false,
            timestamp: block.timestamp,
            selectedChain: _selectedChain
        });
        
        rampRequests[requestCounter] = newRequest;
        userRequests[msg.sender].push(requestCounter);
        
        emit RampRequestCreated(
            requestCounter,
            msg.sender,
            _currency,
            _recipientName,
            _amount,
            usdtEquivalent,
            _selectedChain,
            block.timestamp
        );
        
        return requestCounter;
    }

    /**
     * @dev Complete a ramp request by sending stablecoins
     * @param _requestId The ID of the ramp request
     * @param _tokenAddress The stablecoin token address to send
     */
    function completeRampRequest(uint256 _requestId, address _tokenAddress) 
        external 
        nonReentrant 
    {
        RampRequest storage request = rampRequests[_requestId];
        require(!request.isCompleted, "Request already completed");
        require(request.recipient != address(0), "Request does not exist");
        
        // Calculate fee
        uint256 feeAmount = (request.usdtEquivalent * feePercentage) / 10000;
        uint256 amountAfterFee = request.usdtEquivalent - feeAmount;
        
        // Transfer stablecoins from sender to recipient
        IERC20 token = IERC20(_tokenAddress);
        require(
            token.transferFrom(msg.sender, request.recipient, amountAfterFee),
            "Transfer failed"
        );
        
        // Transfer fee to contract owner
        if (feeAmount > 0) {
            require(
                token.transferFrom(msg.sender, owner(), feeAmount),
                "Fee transfer failed"
            );
            emit FeeCollected(_requestId, feeAmount, _tokenAddress, block.timestamp);
        }
        
        request.isCompleted = true;
        
        emit RampRequestCompleted(
            _requestId,
            msg.sender,
            request.recipient,
            request.amount,
            request.currency,
            request.usdtEquivalent,
            request.selectedChain,
            block.timestamp
        );
    }

    /**
     * @dev Update exchange rate for a currency
     * @param _currency Currency code
     * @param _newRate New rate in basis points
     */
    function updateRate(string memory _currency, uint256 _newRate) external onlyOwner {
        require(bytes(_currency).length > 0, "Currency cannot be empty");
        require(_newRate > 0, "Rate must be greater than 0");
        
        uint256 oldRate = rates[_currency].rate;
        rates[_currency] = Rate(_newRate, true, block.timestamp);
        
        emit RateUpdated(_currency, oldRate, _newRate, block.timestamp);
    }

    /**
     * @dev Calculate USDT equivalent for a given fiat amount
     * @param _amount Amount in fiat
     * @param _currency Currency code
     * @return USDT equivalent amount
     */
    function calculateUsdtEquivalent(uint256 _amount, string memory _currency) 
        public 
        view 
        returns (uint256) 
    {
        Rate memory rate = rates[_currency];
        require(rate.isActive, "Currency not supported");
        
        return (_amount * rate.rate) / 10000;
    }

    /**
     * @dev Get ramp request details
     * @param _requestId Request ID
     * @return Request details
     */
    function getRampRequest(uint256 _requestId) 
        external 
        view 
        returns (RampRequest memory) 
    {
        return rampRequests[_requestId];
    }

    /**
     * @dev Get all requests for a user
     * @param _user User address
     * @return Array of request IDs
     */
    function getUserRequests(address _user) external view returns (uint256[] memory) {
        return userRequests[_user];
    }

    /**
     * @dev Get current rate for a currency
     * @param _currency Currency code
     * @return Rate details
     */
    function getRate(string memory _currency) external view returns (Rate memory) {
        return rates[_currency];
    }

    /**
     * @dev Update fee percentage (only owner)
     * @param _newFeePercentage New fee percentage in basis points
     */
    function updateFeePercentage(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 1000, "Fee cannot exceed 10%");
        feePercentage = _newFeePercentage;
    }

    /**
     * @dev Enable/disable a currency
     * @param _currency Currency code
     * @param _isActive Whether the currency is active
     */
    function setCurrencyActive(string memory _currency, bool _isActive) external onlyOwner {
        rates[_currency].isActive = _isActive;
    }

    /**
     * @dev Emergency function to pause contract (only owner)
     */
    function pause() external onlyOwner {
        // Implementation for pausing functionality
    }

    /**
     * @dev Get QR code data for a request
     * @param _requestId Request ID
     * @return QR code data string
     */
    function getQRCodeData(uint256 _requestId) external view returns (string memory) {
        RampRequest memory request = rampRequests[_requestId];
        require(request.recipient != address(0), "Request does not exist");
        
        return string(abi.encodePacked(
            "https://lyra.xyz?requestId=",
            _requestId.toString(),
            "&currency=",
            request.currency,
            "&amount=",
            request.amount.toString(),
            "&recipient=",
            toAsciiString(request.recipient)
        ));
    }

    /**
     * @dev Convert address to ASCII string
     * @param _addr Address to convert
     * @return ASCII string representation
     */
    function toAsciiString(address _addr) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(_addr)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
} 