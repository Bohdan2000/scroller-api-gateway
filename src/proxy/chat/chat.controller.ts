import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { ChatClient } from '../../clients/chat.client';

@ApiTags('chat')
@ApiBearerAuth('access-token')
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatClient) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue a Stream Chat token for the current user' })
  issueToken(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.chat.issueToken(body, this.ctx(req));
  }

  @Post('dm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get or create a DM channel with another user' })
  createDm(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.chat.createDm(body, this.ctx(req));
  }

  @Post('group-channel')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a group channel' })
  createGroupChannel(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.chat.createGroupChannel(body, this.ctx(req));
  }

  @Get('channels')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List channels the current user is a member of' })
  getChannels(@Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.chat.getChannels(this.ctx(req));
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
