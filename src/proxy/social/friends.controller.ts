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
import { SocialClient } from '../../clients/social.client';

@ApiTags('friends')
@ApiBearerAuth('access-token')
@Controller('friends')
export class FriendsController {
  constructor(private readonly social: SocialClient) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List friends' })
  getFriends(
    @Query() query: Record<string, string>,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.getFriends(this.toQueryString(query), this.ctx(req));
  }

  @Get('requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List friend requests' })
  getFriendRequests(
    @Query() query: Record<string, string>,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.getFriendRequests(this.toQueryString(query), this.ctx(req));
  }

  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a friend request' })
  sendFriendRequest(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.sendFriendRequest(body, this.ctx(req));
  }

  @Post('requests/:id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a friend request' })
  acceptFriendRequest(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.acceptFriendRequest(id, this.ctx(req));
  }

  @Post('requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a friend request' })
  rejectFriendRequest(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.rejectFriendRequest(id, this.ctx(req));
  }

  @Delete(':profileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a friend' })
  removeFriend(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.removeFriend(profileId, this.ctx(req));
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
