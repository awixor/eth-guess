import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  createWalletClient,
  createPublicClient,
  http,
  formatUnits,
  PublicClient,
  WalletClient,
} from 'viem';
import { privateKeyToAccount, PrivateKeyAccount } from 'viem/accounts';
import { foundry, sepolia } from 'viem/chains';
import { PriceService } from '../price/price.service';
import { EthGuessABI } from './EthGuessABI';
import { GameGateway } from './game.gateway';
import { RoundInfo } from './types/game.types';

@Injectable()
export class GameService implements OnModuleInit {
  private readonly logger = new Logger(GameService.name);
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private account: PrivateKeyAccount;
  private contractAddress: `0x${string}`;
  private isExecuting = false;

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly priceService: PriceService,
    private readonly gameGateway: GameGateway,
  ) {}

  onModuleInit() {
    this.setupViemClients();
  }

  private setupViemClients() {
    const rpcUrl = this.configService.get<string>(
      'RPC_URL',
      'http://127.0.0.1:8545',
    );
    const privateKey = this.configService.get<string>(
      'OPERATOR_PRIVATE_KEY',
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // Anvil Account #1 by default
    );
    const contractAddr = this.configService.get<string>('CONTRACT_ADDRESS');

    if (!contractAddr) {
      this.logger.warn(
        'CONTRACT_ADDRESS is not set in .env! Oracle will not execute rounds. Please set it once deployed.',
      );
    }

    this.contractAddress = (contractAddr ||
      '0x0000000000000000000000000000000000000000') as `0x${string}`;
    this.account = privateKeyToAccount(privateKey as `0x${string}`);
    const chain = rpcUrl.includes('sepolia') ? sepolia : foundry;

    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(rpcUrl),
    });

    this.logger.log(
      `Oracle initialized with internal operator: ${this.account.address}`,
    );
  }

  /**
   * Cron job that runs exactly every 60 seconds (every minute boundary).
   * It fetches the current price from the PriceService, formats it,
   * and sends the transaction to the smart contract.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExecuteRound() {
    if (
      this.contractAddress === '0x0000000000000000000000000000000000000000' ||
      this.isExecuting
    ) {
      if (this.isExecuting) {
        this.logger.warn('[Oracle] Execution already in progress, skipping...');
      }
      return;
    }

    this.isExecuting = true;
    try {
      // Add 2s buffer to ensure blockchain clock has ticked past the minute
      await this.sleep(2000);

      const currentPriceFloat = this.priceService.getCurrentPrice();
      // Assuming the contract price expects 8 decimals (like chainlink)
      const priceWithDecimals = BigInt(Math.floor(currentPriceFloat * 1e8));

      this.logger.log(
        `[Oracle] Attempting to execute round with price: $${currentPriceFloat} (${priceWithDecimals})`,
      );

      // Simulate first to catch reverts quickly (e.g. TooEarly)
      const { request } = await this.publicClient.simulateContract({
        address: this.contractAddress,
        abi: EthGuessABI,
        functionName: 'executeRound',
        args: [priceWithDecimals],
        account: this.account,
      });

      const txHash = await this.walletClient.writeContract(request);
      this.logger.log(`[Oracle] Transaction sent! Hash: ${txHash}`);

      await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      this.logger.log(`[Oracle] Round successfully executed and mined.`);

      // Emit WebSocket events to notify clients
      const roundInfo = await this.getCurrentRoundInfo();
      if ('roundId' in roundInfo && roundInfo.roundId !== 0) {
        this.gameGateway.emitRoundStarted(roundInfo);
      }
    } catch (error) {
      this.logger.error(
        `[Oracle] Failed to execute round: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Helper function for the Backend API to expose current round data
   */
  async getCurrentRoundInfo(): Promise<
    RoundInfo | { status: string; details?: string }
  > {
    if (this.contractAddress === '0x0000000000000000000000000000000000000000') {
      return { status: 'CONTRACT_NOT_CONFIGURED' };
    }

    try {
      const currentRoundId = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: EthGuessABI,
        functionName: 'currentRoundId',
      });

      if (currentRoundId === 0n) {
        return {
          roundId: 0,
          startPrice: '0',
          startTime: 0,
          endTime: 0,
          serverTime: Math.floor(Date.now() / 1000),
          totalPool: '0',
          upPool: '0',
          downPool: '0',
          settled: false,
          remainingTime: 0,
          status: 'NOT_STARTED',
        };
      }

      const [roundData, block] = await Promise.all([
        this.publicClient.readContract({
          address: this.contractAddress,
          abi: EthGuessABI,
          functionName: 'rounds',
          args: [currentRoundId],
        }),
        this.publicClient.getBlock({ blockTag: 'latest' }),
      ]);

      const startTime = Number(roundData[2]);
      const endTime = roundData[7] ? Number(roundData[3]) : startTime + 60;

      return {
        roundId: Number(currentRoundId),
        startPrice: formatUnits(roundData[0], 8),
        startTime,
        endTime,
        serverTime: Number(block.timestamp),
        totalPool: formatUnits(roundData[4], 18),
        upPool: formatUnits(roundData[5], 18),
        downPool: formatUnits(roundData[6], 18),
        settled: roundData[7],
        remainingTime: Math.max(0, endTime - Number(block.timestamp)),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching round data: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        roundId: 0,
        startPrice: '0',
        startTime: 0,
        endTime: 0,
        serverTime: Math.floor(Date.now() / 1000),
        totalPool: '0',
        upPool: '0',
        downPool: '0',
        settled: false,
        remainingTime: 0,
        status: 'ERROR_FETCHING_DATA',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
