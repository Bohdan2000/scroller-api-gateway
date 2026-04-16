import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { SocialClient } from '../../clients/social.client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly social: SocialClient) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all topics' })
  listTopics(
    @Query() query: Record<string, string>,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.listTopics(this.toQueryString(query), this.ctx(req));
  }

  @ApiBearerAuth('access-token')
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my topic preferences' })
  getMyTopics(@Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.social.getMyTopics(this.ctx(req));
  }

  @ApiBearerAuth('access-token')
  @Post('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set my topic preferences' })
  setMyTopics(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.setMyTopics(body, this.ctx(req));
  }

  private ctx(req: FastifyRequest & { requestId: string }) {
    return {
      requestId: req.requestId,
      authorization: req.headers.authorization,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }

  private toQueryString(query: Record<string, string>): string {
    const params = new URLSearchParams(query).toString();
    return params ? `?${params}` : '';
  }
}
