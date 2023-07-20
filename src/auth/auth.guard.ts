import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AuthType } from 'src/auth/authType.decorator';

/**
 * The global auth guard used by the application
 * (checks for valid JWT depending on defined Auth, defaults to checking access token)
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // skip public endpoints
    let authType = this.reflector.getAllAndOverride<AuthType>('auth', [context.getHandler(), context.getClass()]);
    if (authType === AuthType.NONE) return true;
    if (!authType) authType = AuthType.ACCESS;
    const request = context.switchToHttp().getRequest();
    const token =
      authType === AuthType.REFRESH ? this.extractTokenFromCookie(request) : this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();
    try {
      let secret: string | undefined = '';
      let time: number | undefined = 60;
      switch (authType) {
        case AuthType.CONFIRM:
          if (process.env.JWT_CONFIRMATION_TIME) time = parseInt(process.env.JWT_CONFIRMATION_TIME, 10);
          secret = process.env.JWT_CONFIRMATION_SECRET;
          break;
        case AuthType.REFRESH:
          if (process.env.JWT_REFRESH_TIME) time = parseInt(process.env.JWT_REFRESH_TIME, 10);
          secret = process.env.JWT_REFRESH_SECRET;
          break;
        case AuthType.RESET:
          if (process.env.JWT_RESET_PASSWORD_TIME) time = parseInt(process.env.JWT_RESET_PASSWORD_TIME, 10);
          secret = process.env.JWT_RESET_PASSWORD_SECRET;
          break;
        default:
          if (process.env.JWT_ACCESS_TIME) time = parseInt(process.env.JWT_ACCESS_TIME, 10);
          secret = readFileSync(join(__dirname, '..', '..', '..', 'jwtES384pubkey.pem'), 'utf-8');
          break;
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
        algorithms: authType === AuthType.ACCESS ? ['ES384'] : ['HS512'],
        maxAge: time
      });
      request['token'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    if (!process.env.REFRESH_COOKIE_NAME) return undefined;
    return request.cookies[process.env.REFRESH_COOKIE_NAME];
  }
}
