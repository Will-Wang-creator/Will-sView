import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.session as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = await this.authService.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    (request as Request & { user: typeof user }).user = user;
    return true;
  }
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.session as string | undefined;
    if (token) {
      const user = await this.authService.verifyToken(token);
      if (user) {
        (request as Request & { user: typeof user }).user = user;
      }
    }
    return true;
  }
}

export function getRequestUser(
  request: Request,
): import('./auth.service').PublicUser | undefined {
  return (request as Request & { user?: import('./auth.service').PublicUser })
    .user;
}
