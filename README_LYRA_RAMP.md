# LyraRamp - On/Off Ramp Service

A complete on/off ramp service implementation for converting tokens to fiat and vice versa, as described in the flow.md specification.

## 🏗️ **Architecture Overview**

### **Smart Contract (LyraRamp.sol)**

- **Multi-currency support** (MYR, USD, SGD)
- **QR code generation** for payment links
- **Fee collection** (0.5% default)
- **Multi-chain support** (Polygon, Arbitrum, Scroll, Base)
- **Event emission** for subgraph indexing

### **Frontend Components**

- **QR Code Generator** - Creates payment QR codes
- **Ramp Request UI** - Create and complete ramp requests
- **Multi-chain Selection** - Choose blockchain for transactions
- **Rate Display** - Real-time exchange rates

### **Subgraph Integration**

- **Event Indexing** - All ramp events indexed
- **Real-time Queries** - Request status and history
- **Analytics** - Fee collection and usage statistics

## 🚀 **Features Implemented**

### ✅ **Core Functionality**

- [x] **Recipient creates ramp request** with currency, name, amount
- [x] **QR code generation** with payment link
- [x] **Multi-chain support** (Polygon, Arbitrum, Scroll, Base)
- [x] **Rate calculation** (1 MYR = 0.23 USDT)
- [x] **Sender completes request** with stablecoins
- [x] **Fee collection** (0.5% fee)
- [x] **Event indexing** via The Graph

### ✅ **User Experience**

- [x] **Account abstraction** ready (wallet integration)
- [x] **QR code scanning** for payment
- [x] **Real-time rate display**
- [x] **Multi-currency support**
- [x] **Request tracking**

## 📁 **File Structure**

```
packages/
├── foundry/
│   ├── contracts/
│   │   └── LyraRamp.sol              # Main smart contract
│   ├── script/
│   │   └── DeployLyraRamp.s.sol      # Deployment script
│   └── test/
│       └── LyraRamp.t.sol            # Contract tests
├── nextjs/
│   ├── app/
│   │   └── lyra-ramp/
│   │       └── page.tsx              # Main UI
│   └── components/
│       └── LyraRamp/
│           └── QRCodeGenerator.tsx   # QR code component
└── subgraph-lyra/
    ├── subgraph.yaml                 # Subgraph config
    ├── schema.graphql                # GraphQL schema
    └── src/
        └── lyra-ramp.ts              # Event mappings
```

## 🚀 **Quick Start**

### **1. Deploy Smart Contract**

```bash
# Set your private key
export PRIVATE_KEY=your_private_key_here

# Deploy to Scroll Sepolia
./deploy-lyra-ramp.sh
```

### **2. Setup Subgraph**

```bash
# Update contract address in subgraph config
cd packages/subgraph-lyra
# Edit subgraph.yaml with your deployed contract address

# Setup and deploy subgraph
yarn install
yarn codegen
yarn build
yarn deploy
```

### **3. Start Frontend**

```bash
# Start the development server
yarn start

# Navigate to http://localhost:3000/lyra-ramp
```

## 📊 **Smart Contract Functions**

### **Core Functions**

- `createRampRequest()` - Create new ramp request
- `completeRampRequest()` - Complete request with stablecoins
- `calculateUsdtEquivalent()` - Calculate USDT equivalent
- `getQRCodeData()` - Generate QR code data

### **Admin Functions**

- `updateRate()` - Update exchange rates
- `updateFeePercentage()` - Update fee percentage
- `setCurrencyActive()` - Enable/disable currencies

### **View Functions**

- `getRampRequest()` - Get request details
- `getUserRequests()` - Get user's requests
- `getRate()` - Get current rates

## 📈 **Events for Subgraph Indexing**

### **RampRequestCreated**

```solidity
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
```

### **RampRequestCompleted**

```solidity
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
```

### **RateUpdated**

```solidity
event RateUpdated(
    string currency,
    uint256 oldRate,
    uint256 newRate,
    uint256 timestamp
);
```

### **FeeCollected**

```solidity
event FeeCollected(
    uint256 indexed requestId,
    uint256 feeAmount,
    address token,
    uint256 timestamp
);
```

## 🎯 **Usage Flow**

### **1. Recipient Creates Request**

1. Navigate to `/lyra-ramp`
2. Select "Create Request" tab
3. Enter currency (MYR, USD, SGD)
4. Enter recipient name
5. Enter amount
6. Select blockchain (Polygon, Arbitrum, etc.)
7. Click "Create Request"

### **2. Generate QR Code**

1. Go to "View Requests" tab
2. Enter request ID
3. Click "Generate QR Code"
4. Download or share QR code

### **3. Sender Completes Request**

1. Scan QR code with wallet
2. Enter amount to send
3. Select stablecoin (USDT/USDC)
4. Choose blockchain
5. Approve transaction
6. Complete payment

### **4. Recipient Receives Funds**

1. Check wallet for received stablecoins
2. View transaction on blockchain explorer
3. Monitor via subgraph queries

## 📊 **Subgraph Queries**

### **Query All Ramp Requests**

```graphql
{
  rampRequests {
    id
    requestId
    recipient
    currency
    amount
    usdtEquivalent
    selectedChain
    isCompleted
    timestamp
  }
}
```

### **Query User Requests**

```graphql
{
  users(where: { address: "0x..." }) {
    id
    address
    requests {
      id
      requestId
      currency
      amount
      isCompleted
    }
  }
}
```

### **Query Completed Requests**

```graphql
{
  rampRequests(where: { isCompleted: true }) {
    id
    requestId
    recipient
    sender
    amount
    currency
    completedAt
  }
}
```

## 🔧 **Configuration**

### **Exchange Rates**

```solidity
// Default rates (basis points)
rates["MYR"] = 2300; // 1 MYR = 0.23 USDT
rates["USD"] = 10000; // 1 USD = 1 USDT
rates["SGD"] = 7500;  // 1 SGD = 0.75 USDT
```

### **Fee Structure**

```solidity
feePercentage = 50; // 0.5% fee in basis points
```

### **Supported Chains**

- Polygon
- Arbitrum
- Scroll
- Base

## 🧪 **Testing**

### **Run Contract Tests**

```bash
yarn test --match-contract LyraRampTest
```

### **Test Functions**

- `testCreateRampRequest()` - Test request creation
- `testCalculateUsdtEquivalent()` - Test rate calculation
- `testCompleteRampRequest()` - Test request completion
- `testGetQRCodeData()` - Test QR code generation

## 🔗 **Integration Points**

### **Account Abstraction**

- Ready for ERC-4337 integration
- Wallet signature verification
- Gasless transactions support

### **Multi-chain Support**

- Cross-chain token transfers
- Chain-specific gas optimization
- Unified interface

### **Rate Providers**

- Oracle integration ready
- Real-time rate updates
- Multi-source rate validation

## 📈 **Analytics & Monitoring**

### **Subgraph Metrics**

- Total requests created
- Completion rates
- Fee collection
- User activity

### **Blockchain Analytics**

- Transaction volume
- Gas usage optimization
- Cross-chain activity

## 🚀 **Next Steps**

### **Phase 2 Enhancements**

- [ ] **Account Abstraction** integration
- [ ] **Real-time rate oracles**
- [ ] **Cross-chain bridges**
- [ ] **Mobile app**
- [ ] **KYC/AML compliance**

### **Phase 3 Features**

- [ ] **Automated market making**
- [ ] **Liquidity pools**
- [ ] **Advanced analytics**
- [ ] **Multi-language support**

## 📞 **Support**

For questions or issues:

1. Check the test files for examples
2. Review the smart contract comments
3. Test with small amounts first
4. Monitor subgraph indexing status

---

**LyraRamp** - Enabling seamless on/off ramp services across multiple blockchains! 🚀
