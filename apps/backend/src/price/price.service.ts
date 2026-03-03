import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CoinGeckoResponse {
  ethereum: {
    usd: number;
  };
}

const COINGECKO_API_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

@Injectable()
export class PriceService implements OnModuleInit {
  private readonly logger = new Logger(PriceService.name);
  private currentPrice: number = 3000; // Default start price
  private readonly useMockPrice: boolean;

  constructor(private readonly config: ConfigService) {
    this.useMockPrice =
      this.config.get<string>('USE_MOCK_PRICE', 'true') === 'true';
  }

  onModuleInit() {
    this.startPriceFeed();
  }

  /**
   * Starts an interval that fetches or simulates a new ETH price every 10 seconds.
   */
  private startPriceFeed() {
    setInterval(() => {
      // Use an IIFE or .catch to handle the promise properly without returning it to setInterval
      void this.fetchPrice().then((price) => {
        this.currentPrice = price;
        this.logger.debug(`ETH Price updated to: $${this.currentPrice}`);
      });
    }, 10000); // 10 seconds
  }

  /**
   * Retrieves the current price. Uses mock logic if configured to avoid rate-limiting
   * during intensive local testing.
   */
  private async fetchPrice(): Promise<number> {
    if (this.useMockPrice) {
      // Simulate price fluctuation between -1% and +1%
      const volatility = 0.01;
      const change = this.currentPrice * volatility * (Math.random() * 2 - 1);

      return Math.round((this.currentPrice + change) * 100) / 100; // 2 decimal places
    }

    try {
      const response = await fetch(COINGECKO_API_URL);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = (await response.json()) as CoinGeckoResponse;
      return data.ethereum.usd;
    } catch (error) {
      this.logger.error(
        `Failed to fetch live price: ${error instanceof Error ? error.message : String(error)}. Returning last known price.`,
      );
      return this.currentPrice;
    }
  }

  /**
   * Returns the latest recorded ETH price.
   */
  getCurrentPrice(): number {
    return this.currentPrice;
  }
}
