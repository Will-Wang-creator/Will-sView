import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  AuthService,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setSessionCookie(res: Response, token: string) {
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE * 1000,
      path: '/',
    });
  }

  @Post('login')
  async login(
    @Body() body: { email?: string; password?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const result = await this.authService.login(email, password, {
      ipAddress:
        (req.headers['x-forwarded-for'] as string) ??
        (req.headers['x-real-ip'] as string),
      userAgent: req.headers['user-agent'],
    });

    if (!result) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.setSessionCookie(res, result.token);
    return { user: result.user };
  }

  @Post('register')
  async register(
    @Body() body: { email?: string; password?: string; name?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password, name } = body;
    if (!email || !password || !name) {
      throw new BadRequestException('Email, password, and name are required');
    }

    const result = await this.authService.register(email, password, name, {
      ipAddress:
        (req.headers['x-forwarded-for'] as string) ??
        (req.headers['x-real-ip'] as string),
      userAgent: req.headers['user-agent'],
    });

    if (!result) {
      throw new BadRequestException('Email already registered');
    }

    this.setSessionCookie(res, result.token);
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  }
}
