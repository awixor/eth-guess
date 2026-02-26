import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Use this guard on any route that requires a valid JWT cookie.
 *
 * @example
 * @UseGuards(JwtAuthGuard)
 * @Get('me')
 * getMe(@CurrentUser() user: JwtPayload) { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
