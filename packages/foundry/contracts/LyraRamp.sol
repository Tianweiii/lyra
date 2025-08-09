// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LyraRamp
 * @dev On/Off ramp service for cross-chain token conversions and payments
 */
contract LyraRamp is ReentrancyGuard, Ownable {
    struct Payment {
        address recipient;
        string currency;
        string recipientName;
        uint256 amount;
        uint256 stablecoinAmount;
        uint256 paymentId;
        bool isCompleted;
        uint256 timestamp;
        string sourceChain;
        string targetChain;
        address sender;
        address stablecoinToken;
    }

    // State Variables
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256[]) public userPayments;
    
    uint256 public paymentCounter;
    uint256 public feePercentage = 50; // 0.5% fee in basis points
    
    // Supported stablecoins
    mapping(address => bool) public supportedStablecoins;
    
    // Events
    event PaymentCompleted(
        uint256 indexed paymentId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        string currency,
        uint256 stablecoinAmount,
        string sourceChain,
        string targetChain,
        address stablecoinToken,
        uint256 timestamp
    );
    
    event FeeCollected(
        uint256 indexed paymentId,
        uint256 feeAmount,
        address token,
        uint256 timestamp
    );

    event StablecoinAdded(address token, uint256 timestamp);
    event StablecoinRemoved(address token, uint256 timestamp);

    // Constructor
    constructor() Ownable(msg.sender) {
        // Initialize with common stablecoins
        // USDT, USDC, DAI addresses will be set by owner
    }

    /**
     * @dev Complete a cross-chain payment
     * @param _recipient Recipient address
     * @param _currency Currency code
     * @param _recipientName Name of recipient
     * @param _amount Amount in fiat currency
     * @param _stablecoinAmount Amount in stablecoins (6 decimals)
     * @param _sourceChain Source blockchain
     * @param _targetChain Target blockchain
     * @param _stablecoinToken Stablecoin token address
     */
    function completePayment(
        address _recipient,
        string memory _currency,
        string memory _recipientName,
        uint256 _amount,
        uint256 _stablecoinAmount,
        string memory _sourceChain,
        string memory _targetChain,
        address _stablecoinToken
    ) external nonReentrant {
        require(_recipient != address(0), "Invalid recipient address");
        require(bytes(_currency).length > 0, "Currency cannot be empty");
        require(bytes(_recipientName).length > 0, "Recipient name cannot be empty");
        require(_amount > 0, "Amount must be greater than 0");
        require(_stablecoinAmount > 0, "Stablecoin amount must be greater than 0");
        require(supportedStablecoins[_stablecoinToken], "Stablecoin not supported");
        
        paymentCounter++;
        
        // Calculate fee
        uint256 feeAmount = (_stablecoinAmount * feePercentage) / 10000;
        uint256 amountAfterFee = _stablecoinAmount - feeAmount;
        
        // Transfer stablecoins from sender to recipient
        IERC20 token = IERC20(_stablecoinToken);
        require(
            token.transferFrom(msg.sender, _recipient, amountAfterFee),
            "Transfer failed"
        );
        
        // Transfer fee to contract owner
        if (feeAmount > 0) {
            require(
                token.transferFrom(msg.sender, owner(), feeAmount),
                "Fee transfer failed"
            );
            emit FeeCollected(paymentCounter, feeAmount, _stablecoinToken, block.timestamp);
        }
        
        // Record the payment
        Payment memory newPayment = Payment({
            recipient: _recipient,
            currency: _currency,
            recipientName: _recipientName,
            amount: _amount,
            stablecoinAmount: _stablecoinAmount,
            paymentId: paymentCounter,
            isCompleted: true,
            timestamp: block.timestamp,
            sourceChain: _sourceChain,
            targetChain: _targetChain,
            sender: msg.sender,
            stablecoinToken: _stablecoinToken
        });
        
        payments[paymentCounter] = newPayment;
        userPayments[_recipient].push(paymentCounter);
        userPayments[msg.sender].push(paymentCounter);
        
        emit PaymentCompleted(
            paymentCounter,
            msg.sender,
            _recipient,
            _amount,
            _currency,
            _stablecoinAmount,
            _sourceChain,
            _targetChain,
            _stablecoinToken,
            block.timestamp
        );
    }

    /**
     * @dev Get payment details
     * @param _paymentId Payment ID
     * @return Payment details
     */
    function getPayment(uint256 _paymentId) 
        external 
        view 
        returns (Payment memory) 
    {
        return payments[_paymentId];
    }

    /**
     * @dev Get all payments for a user
     * @param _user User address
     * @return Array of payment IDs
     */
    function getUserPayments(address _user) external view returns (uint256[] memory) {
        return userPayments[_user];
    }

    /**
     * @dev Add supported stablecoin (only owner)
     * @param _token Stablecoin token address
     */
    function addSupportedStablecoin(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        supportedStablecoins[_token] = true;
        emit StablecoinAdded(_token, block.timestamp);
    }

    /**
     * @dev Remove supported stablecoin (only owner)
     * @param _token Stablecoin token address
     */
    function removeSupportedStablecoin(address _token) external onlyOwner {
        supportedStablecoins[_token] = false;
        emit StablecoinRemoved(_token, block.timestamp);
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
     * @dev Check if stablecoin is supported
     * @param _token Stablecoin token address
     * @return bool
     */
    function isStablecoinSupported(address _token) external view returns (bool) {
        return supportedStablecoins[_token];
    }
} 