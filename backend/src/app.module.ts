import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { MembersModule } from './members/members.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [AuthModule, ArticlesModule, MembersModule, CheckoutModule],
  controllers: [AppController],
})
export class AppModule {}
