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
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { SocialClient } from '../../clients/social.client';

@ApiTags('groups')
@ApiBearerAuth('access-token')
@Controller('groups')
export class GroupsController {
  constructor(private readonly social: SocialClient) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a group' })
  createGroup(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.createGroup(body, this.ctx(req));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get group by ID' })
  getGroup(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.getGroup(id, this.ctx(req));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update group' })
  updateGroup(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.updateGroup(id, body, this.ctx(req));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete group' })
  deleteGroup(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.deleteGroup(id, this.ctx(req));
  }

  @Get(':id/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List group members' })
  getGroupMembers(
    @Param('id') id: string,
    @Query() query: Record<string, string>,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.getGroupMembers(id, this.toQueryString(query), this.ctx(req));
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add member to group' })
  addGroupMember(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.addGroupMember(id, body, this.ctx(req));
  }

  @Patch(':id/members/:profileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update member role' })
  updateGroupMember(
    @Param('id') id: string,
    @Param('profileId') profileId: string,
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.updateGroupMember(id, profileId, body, this.ctx(req));
  }

  @Delete(':id/members/:profileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member from group' })
  removeGroupMember(
    @Param('id') id: string,
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.removeGroupMember(id, profileId, this.ctx(req));
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
