import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SiweMessage } from 'siwe';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import { VerifyAuthDto } from './dto/verify-auth.dto';

interface NonceEntry {
  nonce: string;
  expiresAt: number; // Unix ms timestamp
}

const NONCE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const COOKIE_NAME = 'access_token';

@Injectable()
export class AuthService {
  /** In-memory nonce store: address (lowercase) → { nonce, expiresAt } */
  private readonly nonceStore = new Map<string, NonceEntry>();

  constructor(private readonly jwtService: JwtService) {}

  // ---------------------------------------------------------------------------
  // Nonce
  // ---------------------------------------------------------------------------

  generateNonce(address: string): string {
    const key = address.toLowerCase();
    const nonce = uuidv4();
    this.nonceStore.set(key, { nonce, expiresAt: Date.now() + NONCE_TTL_MS });
    return nonce;
  }

  private consumeNonce(address: string): string {
    const key = address.toLowerCase();
    const entry = this.nonceStore.get(key);

    if (!entry) {
      throw new UnauthorizedException(
        'No nonce found for this address. Request a new one.',
      );
    }

    if (Date.now() > entry.expiresAt) {
      this.nonceStore.delete(key);
      throw new UnauthorizedException('Nonce has expired. Request a new one.');
    }

    this.nonceStore.delete(key); // consume — single use
    return entry.nonce;
  }

  // ---------------------------------------------------------------------------
  // Verify SIWE + issue JWT cookie
  // ---------------------------------------------------------------------------

  async verifyAndLogin(
    dto: VerifyAuthDto,
    res: express.Response,
  ): Promise<{ address: string }> {
    let siweMessage: SiweMessage;

    try {
      siweMessage = new SiweMessage(dto.message);
    } catch {
      throw new BadRequestException('Invalid SIWE message format.');
    }

    const address = siweMessage.address;
    const expectedNonce = this.consumeNonce(address); // throws if missing/expired

    const result = await siweMessage.verify({
      signature: dto.signature,
      nonce: expectedNonce,
    });

    if (!result.success) {
      const errMsg =
        result.error instanceof Error
          ? result.error.message
          : JSON.stringify(result.error);
      throw new UnauthorizedException(`SIWE verification failed: ${errMsg}`);
    }

    const payload = { address };
    const token = this.jwtService.sign(payload);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    return { address };
  }

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  logout(res: express.Response): void {
    res.clearCookie(COOKIE_NAME);
  }
}
