import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ArticlesController],
})
export class ArticlesModule {}
