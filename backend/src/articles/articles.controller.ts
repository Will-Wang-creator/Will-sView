import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  addComment,
  getComments,
  getLikeCount,
  isLiked,
  toggleLike,
  recordArticleView,
} from '../lib/engagement';
import { AuthGuard, getRequestUser, OptionalAuthGuard } from '../auth/auth.guard';

@Controller('api/articles/:slug')
export class ArticlesController {
  @Get('engagement')
  @UseGuards(OptionalAuthGuard)
  async getEngagement(@Param('slug') slug: string, @Req() req: Request) {
    const user = getRequestUser(req);
    return {
      likes: await getLikeCount(slug),
      liked: await isLiked(slug, user?.id),
      comments: await getComments(slug),
    };
  }

  @Post('engagement')
  @UseGuards(OptionalAuthGuard)
  async postEngagement(
    @Param('slug') slug: string,
    @Body() body: { action?: string; text?: string },
    @Req() req: Request,
  ) {
    const user = getRequestUser(req);

    if (body.action === 'like') {
      if (!user) {
        throw new UnauthorizedException('Sign in to like');
      }
      return toggleLike(slug, user.id);
    }

    if (body.action === 'comment') {
      if (!user) {
        throw new UnauthorizedException('Sign in to comment');
      }
      if (!body.text?.trim()) {
        throw new BadRequestException('Comment cannot be empty');
      }
      const comment = await addComment(slug, user.id, user.name, body.text);
      return { comment };
    }

    throw new BadRequestException('Invalid action');
  }

  @Post('view')
  @UseGuards(AuthGuard)
  async recordView(@Param('slug') slug: string, @Req() req: Request) {
    const user = getRequestUser(req)!;
    await recordArticleView(slug, user.id);
    return { ok: true };
  }
}
