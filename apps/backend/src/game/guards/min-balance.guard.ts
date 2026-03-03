import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http, formatEther, PublicClient } from 'viem';
import { localhost, sepolia } from 'viem/chains';
import { JwtPayload } from '../../auth/decorators/current-user.decorator';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Injectable()
export class MinBalanceGuard implements CanActivate {
  private readonly logger = new Logger(MinBalanceGuard.name);
  private publicClient: PublicClient;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>(
      'RPC_URL',
      'http://127.0.0.1:8545',
    );
    const chain = rpcUrl.includes('sepolia') ? sepolia : localhost;

    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user; // Typed as JwtPayload

    if (!user || !user.address) {
      this.logger.warn(
        'MinBalanceGuard failed: No user address found in request.',
      );
      throw new ForbiddenException('User address not found.');
    }

    try {
      const balance = await this.publicClient.getBalance({
        address: user.address as `0x${string}`,
      });

      const balanceInEth = parseFloat(formatEther(balance));

      if (balanceInEth < 0.1) {
        this.logger.warn(
          `MinBalanceGuard rejected ${user.address} (Balance: ${balanceInEth} ETH)`,
        );
        throw new ForbiddenException(
          'Insufficient balance. You need at least 0.1 ETH to enter the Whale Room.',
        );
      }

      return true; // Access granted
    } catch (error) {
      this.logger.error(
        `Error checking balance for ${user.address}: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (error instanceof ForbiddenException) throw error;
      throw new ForbiddenException(
        'Unable to verify wallet balance at this time.',
      );
    }
  }
}
