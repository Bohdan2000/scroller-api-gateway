import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { ContentClient } from '../../clients/content.client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('videos')
@ApiBearerAuth('access-token')
@Controller()
export class VideosController {
  constructor(private readonly content: ContentClient) {}

  @Post('videos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new video (DRAFT)' })
  createVideo(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.content.createVideo(body, this.ctx(req));
  }

  @Public()
  @Get('videos/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get video by ID (public videos accessible without auth)' })
  getVideo(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.content.getVideo(id, this.ctx(req));
  }

  @Patch('videos/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update video metadata' })
  updateVideo(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.content.updateVideo(id, body, this.ctx(req));
  }

  @Delete('videos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a video' })
  deleteVideo(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.content.deleteVideo(id, this.ctx(req));
  }

  @Post('videos/:id/upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a Mux direct upload URL' })
  requestUploadUrl(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.content.requestUploadUrl(id, body, this.ctx(req));
  }

  @Post('videos/:id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a ready video' })
  publishVideo(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.content.publishVideo(id, this.ctx(req));
  }

  @Post('videos/:id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish a video (PUBLISHED → READY)' })
  unpublishVideo(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.content.unpublishVideo(id, this.ctx(req));
  }

  @Get('me/videos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List own videos' })
  getMyVideos(@Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.content.getMyVideos(this.ctx(req));
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
