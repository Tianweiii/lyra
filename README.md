# LYRA – Blockchain-Powered Aid Distribution That Works

## 🚀 Overview
The **LYRA QR Merchant Payment System** is a blockchain-powered payment solution enabling merchants to receive **LYRA token** payments instantly via QR codes.  

The **Lyra token** will be disbursed by the federal government to all registered users.  
Merchants generate QR codes with payment details, and users scan them to initiate secure, on-chain transfers — no centralized payment gateways required.

The system is designed for the **Polygon network (Chain ID: 137)** and integrates with the **LyraToken** and **LyraOtcSeller** smart contracts for merchant verification, token transfers, and swaps.

---

## ✨ Features

### **Merchant QR Code Generation**  
Merchants can generate QR codes containing:
- Merchant wallet address
- Payment amount
- Additional metadata

### **User Payment via QR Scan**  
Users scan the merchant’s QR code, verify details, and pay using LYRA tokens directly on-chain.

### **Government Token Disbursement**  
The government can distribute LYRA tokens directly to citizens’ wallets through the system.

### **Blockchain Smart Contract Integration**  
Seamless interaction with:
- **`LyraOtcSeller`** for merchant verification, token swaps, and transfers
- **`LyraToken`** ERC-20 contract for token balance management

### **Multi-Network Ready**  
Currently deployed on Polygon (Chain ID: 137) but adaptable to other EVM-compatible networks.

### **Real-Time Balance Conversion**  
Wallet balances are shown in **MYR** and **USD** using live exchange rate APIs.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), TailwindCSS, Framer Motion, Material UI, PWA Notifications
- **Blockchain:** Polygon (EVM), Scaffold-ETH, Wagmi, Viem
- **Wallet:** RainbowKit, Web3Auth
- **QR Code:** `react-qr-code` (generation), `@zxing/browser` (scanning)
- **Smart Contracts:**
  - `LyraOtcSeller` – merchant verification & OTC swaps
  - `LyraToken` – ERC-20 LYRA token

---

## ⚙️ Installation & Setup

### 1️⃣ Prerequisites
- **Node.js** v18+
- **Yarn** or **npm**
- Browser with **MetaMask** or **WalletConnect**
- Access to **Polygon Network (Chain ID: 137)**

---

### 2️⃣ Clone the Repository
```bash
git clone https://github.com/Tianweiii/lyra.git
cd lyra
```

### 3️⃣ Install Dependencies
```bash
yarn install
# or
npm install
```

### 4️⃣ Environment Variables
- Create a `.env.local` file in the root directory:
```env
WEB3_AUTH_CLIENT_ID = WEB3_AUTH_CLIENT_ID_EXAMPLE
NEXT_PUBLIC_VAPID_PUBLIC_KEY = NEXT_PUBLIC_VAPID_PUBLIC_KEY_EXAMPLE
VAPID_PRIVATE_KEY = VAPID_PRIVATE_KEY_EXAMPLE
NEXT_PUBLIC_SUPABASE_URL = https://example.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = NEXT_PUBLIC_SUPABASE_ANON_KEY_EXAMPLE
```

### 5️⃣ Run the development server
```
yarn start
```


## 🔗 Smart Contract Integration
**Read Functions** 📖
- `isMerchant(address merchant)` → Checks if the address is registered as a merchant.  
- `priceUsdtPerNative()` → Returns MATIC price in USDT.  
- `lyraPerUsdt()` → Returns LYRA price in USDT.  
- `balanceOf(address account)` → Returns LYRA token balance for an address.

**Write Functions** 📝
- `transfer(address to, uint256 amount)` → Transfers LYRA tokens.  
- `merchantSwapLyraToUsdt(uint256 lyraAmount, uint256 minUsdt)` → Swaps LYRA for USDT.  
- `merchantSwapLyraToNative(uint256 lyraAmount, uint256 minNative)` → Swaps LYRA for MATIC.


## 🤝 Contributing
We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.


## 📝 License
This project is licensed under the MIT License - see [LICENSE](LICENCE) for details.

## 📬 References & Support
🌐 **Website:** [Lyra]() <br>
🐞 **GitHub Issues:** [Report Issues](https://github.com/Tianweiii/lyra/issues)