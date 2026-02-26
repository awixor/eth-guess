import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  address: string;
  iat: number;
  exp: number;
}

/**
 * Parameter decorator that extracts the authenticated user from the request.
 * Usage: handler(@CurrentUser() user: JwtPayload)
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
