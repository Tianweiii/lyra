// Rate service for fetching exchange rates from external APIs

interface ExchangeRate {
  currency: string;
  rate: number;
  lastUpdated: string;
}

interface RateResponse {
  success: boolean;
  rate?: number;
  error?: string;
}

class RateService {
  private static instance: RateService;
  private rates: Map<string, ExchangeRate> = new Map();
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Initialize with some default rates
    this.rates.set("MYR", { currency: "MYR", rate: 0.23, lastUpdated: new Date().toISOString() });
    this.rates.set("USD", { currency: "USD", rate: 1.0, lastUpdated: new Date().toISOString() });
    this.rates.set("SGD", { currency: "SGD", rate: 0.75, lastUpdated: new Date().toISOString() });
  }

  public static getInstance(): RateService {
    if (!RateService.instance) {
      RateService.instance = new RateService();
    }
    return RateService.instance;
  }

  /**
   * Fetch exchange rate from external API
   * @param currency Currency code (e.g., "MYR", "USD", "SGD")
   * @returns Promise<RateResponse>
   */
  public async fetchRate(currency: string): Promise<RateResponse> {
    try {
      // Check if we have a cached rate that's still valid
      const cachedRate = this.rates.get(currency);
      if (cachedRate && Date.now() - this.lastUpdate < this.CACHE_DURATION) {
        return { success: true, rate: cachedRate.rate };
      }

      // Fetch from external API (using a free forex API)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.rates && data.rates[currency]) {
        const rate = 1 / data.rates[currency]; // Convert to USD to USDT rate
        const exchangeRate: ExchangeRate = {
          currency,
          rate,
          lastUpdated: new Date().toISOString(),
        };

        this.rates.set(currency, exchangeRate);
        this.lastUpdate = Date.now();

        return { success: true, rate };
      } else {
        // Fallback to default rates if API doesn't have the currency
        const defaultRates: { [key: string]: number } = {
          MYR: 0.23,
          USD: 1.0,
          SGD: 0.75,
        };

        if (defaultRates[currency]) {
          const rate = defaultRates[currency];
          const exchangeRate: ExchangeRate = {
            currency,
            rate,
            lastUpdated: new Date().toISOString(),
          };

          this.rates.set(currency, exchangeRate);
          return { success: true, rate };
        }

        return { success: false, error: `Currency ${currency} not supported` };
      }
    } catch (error) {
      console.error("Error fetching rate:", error);

      // Return cached rate if available, otherwise error
      const cachedRate = this.rates.get(currency);
      if (cachedRate) {
        return { success: true, rate: cachedRate.rate };
      }

      return { success: false, error: "Failed to fetch exchange rate" };
    }
  }

  /**
   * Calculate USDT equivalent for a given amount and currency
   * @param amount Amount in fiat currency
   * @param currency Currency code
   * @returns Promise<number> USDT equivalent
   */
  public async calculateUsdtEquivalent(amount: number, currency: string): Promise<number> {
    const rateResponse = await this.fetchRate(currency);

    if (!rateResponse.success || !rateResponse.rate) {
      throw new Error(rateResponse.error || "Failed to calculate USDT equivalent");
    }

    return amount * rateResponse.rate;
  }

  /**
   * Get cached rate for a currency
   * @param currency Currency code
   * @returns ExchangeRate | undefined
   */
  public getCachedRate(currency: string): ExchangeRate | undefined {
    return this.rates.get(currency);
  }

  /**
   * Get all cached rates
   * @returns Map<string, ExchangeRate>
   */
  public getAllRates(): Map<string, ExchangeRate> {
    return new Map(this.rates);
  }
}

export default RateService.getInstance();
