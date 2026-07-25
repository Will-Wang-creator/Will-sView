import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { getRequestUser, OptionalAuthGuard } from '../auth/auth.guard';

const pricingPlans = [
  { id: 'monthly', name: 'Monthly', price: 12, interval: 'month' as const },
  { id: 'annual', name: 'Annual', price: 120, interval: 'year' as const },
];

function subscriptionEndDate(planId: string): string {
  const end = new Date();
  if (planId === 'monthly') {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end.toISOString().split('T')[0];
}

@Controller('api/checkout')
export class CheckoutController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  async checkout(
    @Body() body: { planId?: string },
    @Req() req: Request,
  ) {
    const plan = pricingPlans.find((p) => p.id === body.planId);
    if (!plan) {
      throw new BadRequestException('Invalid plan');
    }

    const user = getRequestUser(req);
    if (!user) {
      throw new UnauthorizedException('Sign in to subscribe');
    }

    await this.authService.activateSubscription(
      user.email,
      subscriptionEndDate(body.planId!),
      body.planId,
    );

    const origin =
      (req.headers.origin as string) ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';

    return { url: `${origin}/subscribe/success` };
  }
}
