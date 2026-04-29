import { Controller, Get, HttpCode, HttpStatus, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { SocialClient } from '../../clients/social.client';

@ApiTags('profiles')
@ApiBearerAuth('access-token')
@Controller('profiles')
export class PublicProfilesController {
  constructor(private readonly social: SocialClient) {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search profiles by username or display name' })
  searchProfiles(
    @Query() query: Record<string, string>,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    const params = new URLSearchParams(query).toString();
    return this.social.searchProfiles(params ? `?${params}` : '', this.ctx(req));
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
