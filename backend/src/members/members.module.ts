import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MembersController],
})
export class MembersModule {}
