import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
