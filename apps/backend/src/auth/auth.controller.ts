import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyAuthDto } from './dto/verify-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * GET /api/auth/nonce?address=0x...
   * Returns a freshly generated nonce for the given wallet address.
   */
  @Get('nonce')
  getNonce(@Query('address') address: string): { nonce: string } {
    if (!address) {
      return { nonce: this.authService.generateNonce('anonymous') };
    }
    return { nonce: this.authService.generateNonce(address) };
  }

  /**
   * POST /api/auth/verify
   * Verifies a signed SIWE message and issues a JWT cookie on success.
   * Body: { message: string, signature: string }
   *
   * Note: `res` is typed `any` — using express.Response here triggers
   * TS1272 (isolatedModules + emitDecoratorMetadata incompatibility).
   * The runtime value is always a valid Express Response object.
   */
  @Post('verify')
  @HttpCode(200)
  async verify(
    @Body() dto: VerifyAuthDto,
    @Res({ passthrough: true }) res: never,
  ): Promise<{ address: string }> {
    return this.authService.verifyAndLogin(
      dto,
      res as unknown as import('express').Response,
    );
  }

  /**
   * POST /api/auth/logout
   * Clears the JWT cookie.
   */
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: never): { message: string } {
    this.authService.logout(res as unknown as import('express').Response);
    return { message: 'Logged out successfully.' };
  }

  /**
   * GET /api/auth/me
   * Protected route — returns the current authenticated user's payload.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }
}
