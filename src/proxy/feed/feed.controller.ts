import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { FeedClient } from '../../clients/feed.client';

@ApiTags('feed')
@ApiBearerAuth('access-token')
@Controller()
export class FeedController {
  constructor(private readonly feed: FeedClient) {}

  @Get('feed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get personalised feed',
    description:
      'Returns a ranked page of video IDs. Pass `nextCursor` on subsequent requests. ' +
      'Enrich each `videoId` by calling GET /videos/:id.',
  })
  getFeed(
    @Query() query: Record<string, string>,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.feed.getFeed(query, this.ctx(req));
  }

  @Post('feed/events/impression')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record video impressions (which videos the user saw)' })
  recordImpression(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.feed.recordImpression(body, this.ctx(req));
  }

  @Post('feed/events/watch')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record how long the user watched a video' })
  recordWatch(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.feed.recordWatch(body, this.ctx(req));
  }

  @Post('feed/events/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Like a video' })
  likeVideo(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.feed.likeVideo(body, this.ctx(req));
  }

  @Delete('feed/events/like/:videoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlike a video' })
  unlikeVideo(
    @Param('videoId') videoId: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.feed.unlikeVideo(videoId, this.ctx(req));
  }

  @Post('feed/events/share')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record a share event' })
  shareVideo(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.feed.shareVideo(body, this.ctx(req));
  }

  private ctx(req: FastifyRequest & { requestId: string }) {
    return {
      requestId: req.requestId,
      authorization: req.headers.authorization,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
