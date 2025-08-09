// Token swap service for cross-chain conversions

interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  gasEstimate: string;
  route: string[];
}

interface BridgeQuote {
  fromChain: string;
  toChain: string;
  token: string;
  amount: string;
  fee: string;
  estimatedTime: string;
}

interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  nativeToken: string;
  stablecoins: {
    USDT: string;
    USDC: string;
    DAI: string;
  };
}

class TokenSwapService {
  private static instance: TokenSwapService;
  private chains: Map<string, ChainConfig> = new Map();

  // Chains supported by 1inch API
  private supportedChains = [1, 137, 42161, 8453]; // Ethereum, Polygon, Arbitrum, Base

  private constructor() {
    this.initializeChains();
  }

  public static getInstance(): TokenSwapService {
    if (!TokenSwapService.instance) {
      TokenSwapService.instance = new TokenSwapService();
    }
    return TokenSwapService.instance;
  }

  private initializeChains() {
    // Initialize supported chains
    this.chains.set("polygon", {
      id: 137,
      name: "Polygon",
      rpcUrl: "https://polygon-rpc.com",
      explorer: "https://polygonscan.com",
      nativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
      stablecoins: {
        USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      },
    });

    this.chains.set("arbitrum", {
      id: 42161,
      name: "Arbitrum One",
      rpcUrl: "https://arb1.arbitrum.io/rpc",
      explorer: "https://arbiscan.io",
      nativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
      stablecoins: {
        USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      },
    });

    this.chains.set("scroll", {
      id: 534352,
      name: "Scroll",
      rpcUrl: "https://rpc.scroll.io",
      explorer: "https://scrollscan.com",
      nativeToken: "0x5300000000000000000000000000000000000004", // WETH
      stablecoins: {
        USDT: "0xF086deDf6a89E7B16145B03A6Cb461C97670C5Ce",
        USDC: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
        DAI: "0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97",
      },
    });

    this.chains.set("scrollSepolia", {
      id: 534351,
      name: "Scroll Sepolia",
      rpcUrl: "https://sepolia-rpc.scroll.io",
      explorer: "https://sepolia.scrollscan.com",
      nativeToken: "0x5300000000000000000000000000000000000004", // WETH
      stablecoins: {
        USDT: "0xF086deDf6a89E7B16145B03A6Cb461C97670C5Ce",
        USDC: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
        DAI: "0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97",
      },
    });

    this.chains.set("base", {
      id: 8453,
      name: "Base",
      rpcUrl: "https://mainnet.base.org",
      explorer: "https://basescan.org",
      nativeToken: "0x4200000000000000000000000000000000000006", // WETH
      stablecoins: {
        USDT: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
        USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      },
    });
  }

  /**
   * Get swap quote from our Next.js API route
   * @param fromToken Source token address
   * @param toToken Destination token address
   * @param amount Amount to swap
   * @param chainId Chain ID
   * @returns Promise<SwapQuote>
   */
  public async getSwapQuote(
    fromToken: string,
    toToken: string,
    amount: string,
    chainId: number,
  ): Promise<SwapQuote | null> {
    // Check if chain is supported by 1inch
    if (!this.supportedChains.includes(chainId)) {
      console.warn(`Chain ${chainId} is not supported by 1inch API`);
      return null;
    }

    try {
      // Use our Next.js API route instead of direct 1inch API call
      const response = await fetch(
        `/api/swap/quote?chainId=${chainId}&fromToken=${fromToken}&toToken=${toToken}&amount=${amount}`,
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        fromToken: data.fromToken?.address || fromToken,
        toToken: data.toToken?.address || toToken,
        fromAmount: data.fromTokenAmount || amount,
        toAmount: data.toTokenAmount || "0",
        priceImpact: data.priceImpact || 0,
        gasEstimate: data.gas || "0",
        route: data.protocols?.flat() || [],
      };
    } catch (error) {
      console.error("Error getting swap quote:", error);
      return null;
    }
  }

  /**
   * Execute token swap using our Next.js API route
   * @param fromToken Source token address
   * @param toToken Destination token address
   * @param amount Amount to swap
   * @param chainId Chain ID
   * @param userAddress User wallet address
   * @returns Promise<string> Transaction hash
   */
  public async executeSwap(
    fromToken: string,
    toToken: string,
    amount: string,
    chainId: number,
    userAddress: string,
  ): Promise<string | null> {
    try {
      // Use our Next.js API route instead of direct 1inch API call
      const response = await fetch("/api/swap/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chainId,
          fromToken,
          toToken,
          amount,
          userAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`Swap execution error: ${response.status}`);
      }

      const data = await response.json();
      return data.txHash;
    } catch (error) {
      console.error("Error executing swap:", error);
      return null;
    }
  }

  /**
   * Get bridge quote from our Next.js API route
   * @param fromChain Source chain
   * @param toChain Destination chain
   * @param token Token address
   * @param amount Amount to bridge
   * @returns Promise<BridgeQuote>
   */
  public async getBridgeQuote(
    fromChain: string,
    toChain: string,
    token: string,
    amount: string,
  ): Promise<BridgeQuote | null> {
    try {
      // Use our Next.js API route instead of direct Wormhole API call
      const response = await fetch(
        `/api/bridge/quote?fromChain=${fromChain}&toChain=${toChain}&token=${token}&amount=${amount}`,
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        fromChain: data.fromChain,
        toChain: data.toChain,
        token: data.token,
        amount: data.amount,
        fee: data.fee,
        estimatedTime: data.estimatedTime,
      };
    } catch (error) {
      console.error("Error getting bridge quote:", error);
      return null;
    }
  }

  /**
   * Execute cross-chain bridge using our Next.js API route
   * @param fromChain Source chain
   * @param toChain Destination chain
   * @param token Token address
   * @param amount Amount to bridge
   * @param userAddress User wallet address
   * @returns Promise<string> Transaction hash
   */
  public async executeBridge(
    fromChain: string,
    toChain: string,
    token: string,
    amount: string,
    userAddress: string,
  ): Promise<string | null> {
    try {
      // Get bridge quote first
      const quote = await this.getBridgeQuote(fromChain, toChain, token, amount);
      if (!quote) {
        throw new Error("Failed to get bridge quote");
      }

      // Use our Next.js API route instead of direct Wormhole API call
      const response = await fetch("/api/bridge/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromChain,
          toChain,
          token,
          amount,
          userAddress,
          fee: quote.fee,
        }),
      });

      if (!response.ok) {
        throw new Error(`Bridge execution error: ${response.status}`);
      }

      const data = await response.json();
      return data.txHash;
    } catch (error) {
      console.error("Error executing bridge:", error);
      return null;
    }
  }

  /**
   * Get chain configuration
   * @param chainName Chain name
   * @returns ChainConfig | undefined
   */
  public getChainConfig(chainName: string): ChainConfig | undefined {
    return this.chains.get(chainName);
  }

  /**
   * Get all supported chains
   * @returns Map<string, ChainConfig>
   */
  public getAllChains(): Map<string, ChainConfig> {
    return new Map(this.chains);
  }

  /**
   * Convert native token to stablecoin
   * @param chainName Chain name
   * @param stablecoin Stablecoin type (USDT, USDC, DAI)
   * @param amount Amount of native token
   * @param userAddress User wallet address
   * @returns Promise<string> Transaction hash
   */
  public async convertToStablecoin(
    chainName: string,
    stablecoin: "USDT" | "USDC" | "DAI",
    amount: string,
    userAddress: string,
  ): Promise<string | null> {
    const chainConfig = this.getChainConfig(chainName);
    if (!chainConfig) {
      throw new Error(`Chain ${chainName} not supported`);
    }

    const nativeToken = chainConfig.nativeToken;
    const stablecoinAddress = chainConfig.stablecoins[stablecoin];

    return await this.executeSwap(nativeToken, stablecoinAddress, amount, chainConfig.id, userAddress);
  }
}

export default TokenSwapService.getInstance();
