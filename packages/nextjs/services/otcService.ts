import { createPublicClient, getAddress, http, parseAbi } from "viem";
import { polygon } from "viem/chains";

// Contract addresses (Polygon Mainnet)
const OTC_SELLER_ADDRESS = "0xd1f520e7ff7947Ef821413c3767Fcc00a71b2fDE";
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

// Contract ABIs
const otcSellerAbi = parseAbi([
  "function getQuoteUsdt(uint256 usdtAmountIn) external pure returns (uint256 lyraOut)",
  "function getQuoteNative(uint256 nativeAmountIn) external view returns (uint256 lyraOut)",
  "function getNativePrice() external view returns (uint256)",
  "function getPolFee(uint256 transactionAmount) external pure returns (uint256)",
  "function buyWithUSDTForRecipient(uint256 usdtAmountIn, address recipient, uint256 minLyraOut) external",
  "function buyWithNativeForRecipient(address recipient, uint256 minLyraOut) external payable",
  "function getBalance(address token) external view returns (uint256)",
]);

const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
]);

const client = createPublicClient({ chain: polygon, transport: http() });

export interface OtcQuote {
  lyraOut: bigint;
  lyraOutFormatted: string;
  priceImpact: number;
  polFee: bigint;
  polFeeFormatted: string;
}

export interface OtcSwapParams {
  amountIn: bigint;
  recipient: string;
  minLyraOut: bigint;
  slippage: number;
}

export class OtcService {
  static async getQuoteUsdt(usdtAmountIn: bigint): Promise<OtcQuote> {
    try {
      const lyraOut = await client.readContract({
        address: getAddress(OTC_SELLER_ADDRESS),
        abi: otcSellerAbi,
        functionName: "getQuoteUsdt",
        args: [usdtAmountIn],
      });

      const polFee = await client.readContract({
        address: getAddress(OTC_SELLER_ADDRESS),
        abi: otcSellerAbi,
        functionName: "getPolFee",
        args: [usdtAmountIn],
      });

      const lyraOutFormatted = (Number(lyraOut) / 10 ** 6).toFixed(6);
      const polFeeFormatted = (Number(polFee) / 10 ** 18).toFixed(6);
      const priceImpact = 0; // Fixed price, no impact

      return { lyraOut, lyraOutFormatted, priceImpact, polFee, polFeeFormatted };
    } catch (error) {
      console.error("OTC USDT quote error:", error);
      throw new Error("Failed to get OTC quote");
    }
  }

  static async getQuoteNative(nativeAmountIn: bigint): Promise<OtcQuote> {
    try {
      const lyraOut = await client.readContract({
        address: getAddress(OTC_SELLER_ADDRESS),
        abi: otcSellerAbi,
        functionName: "getQuoteNative",
        args: [nativeAmountIn],
      });

      const polFee = await client.readContract({
        address: getAddress(OTC_SELLER_ADDRESS),
        abi: otcSellerAbi,
        functionName: "getPolFee",
        args: [nativeAmountIn],
      });

      const lyraOutFormatted = (Number(lyraOut) / 10 ** 6).toFixed(6);
      const polFeeFormatted = (Number(polFee) / 10 ** 18).toFixed(6);
      const priceImpact = 0; // Fixed price, no impact

      return { lyraOut, lyraOutFormatted, priceImpact, polFee, polFeeFormatted };
    } catch (error) {
      console.error("OTC Native quote error:", error);
      throw new Error("Failed to get OTC quote");
    }
  }

  static async getNativePrice(): Promise<number> {
    try {
      const price = await client.readContract({
        address: getAddress(OTC_SELLER_ADDRESS),
        abi: otcSellerAbi,
        functionName: "getNativePrice",
        args: [],
      });

      return Number(price) / 10 ** 6; // Convert from 6 decimals
    } catch (error) {
      console.error("OTC Native price error:", error);
      return 0.23; // Default fallback (updated from 0.5)
    }
  }

  static async checkAllowance(tokenAddress: string, userAddress: string): Promise<bigint> {
    try {
      const allowance = await client.readContract({
        address: getAddress(tokenAddress),
        abi: erc20Abi,
        functionName: "allowance",
        args: [getAddress(userAddress), getAddress(OTC_SELLER_ADDRESS)],
      });

      return allowance;
    } catch (error) {
      console.error("Allowance check error:", error);
      return 0n;
    }
  }

  static async getBalance(tokenAddress: string): Promise<bigint> {
    try {
      const balance = await client.readContract({
        address: getAddress(OTC_SELLER_ADDRESS),
        abi: otcSellerAbi,
        functionName: "getBalance",
        args: [getAddress(tokenAddress)],
      });

      return balance;
    } catch (error) {
      console.error("Balance check error:", error);
      return 0n;
    }
  }

  static async getUsdtBalance(userAddress: string): Promise<bigint> {
    try {
      const balance = await client.readContract({
        address: getAddress(USDT_ADDRESS),
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [getAddress(userAddress)],
      });

      return balance;
    } catch (error) {
      console.error("USDT balance error:", error);
      return 0n;
    }
  }
}
