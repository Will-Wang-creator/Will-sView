import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import {
  getUserComments,
  getUserLikes,
  getUserViews,
} from '../lib/engagement';
import { AuthGuard, getRequestUser } from '../auth/auth.guard';

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

@Controller('api/members')
export class MembersController {
  @Get('activity')
  @UseGuards(AuthGuard)
  async getActivity(@Req() req: Request, @Query('q') q?: string) {
    const user = getRequestUser(req)!;
    const query = q?.trim().toLowerCase() ?? '';

    const [likes, comments, views] = await Promise.all([
      getUserLikes(user.id),
      getUserComments(user.id),
      getUserViews(user.id),
    ]);

    const enrich = <T extends { slug: string; createdAt: string; body?: string }>(
      items: T[],
    ) =>
      items
        .map((item) => ({
          ...item,
          title: slugToTitle(item.slug),
          excerpt: '',
          category: 'Article',
          publishedAt: item.createdAt.slice(0, 10),
        }))
        .filter((item) => {
          if (!query) return true;
          return (
            item.title.toLowerCase().includes(query) ||
            item.slug.toLowerCase().includes(query) ||
            item.body?.toLowerCase().includes(query)
          );
        });

    return {
      likes: enrich(likes),
      comments: enrich(comments),
      views: enrich(views),
    };
  }
}
