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
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { NotificationsClient } from '../../clients/notifications.client';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsClient) {}

  // ─── Inbox ───────────────────────────────────────────────────────────────────

  @Get('notifications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get paginated in-app notification inbox' })
  list(
    @Query() query: Record<string, string>,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    const qs = new URLSearchParams(query as Record<string, string>).toString();
    return this.notifications.listNotifications(qs ? `?${qs}` : '', this.ctx(req));
  }

  @Post('notifications/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id' })
  markRead(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.notifications.markRead(id, this.ctx(req));
  }

  @Post('notifications/:id/ack')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Acknowledge push delivery' })
  @ApiParam({ name: 'id' })
  ackNotification(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.notifications.ackNotification(id, this.ctx(req));
  }

  @Post('notifications/read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.notifications.markAllRead(this.ctx(req));
  }

  // ─── Devices ─────────────────────────────────────────────────────────────────

  @Post('notifications/devices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register or refresh an FCM device token' })
  registerDevice(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.notifications.registerDevice(body, this.ctx(req));
  }

  @Patch('notifications/devices/:id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a device token (sign-out)' })
  @ApiParam({ name: 'id' })
  deactivateDevice(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.notifications.deactivateDevice(id, this.ctx(req));
  }

  @Delete('notifications/devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a device token' })
  @ApiParam({ name: 'id' })
  removeDevice(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.notifications.removeDevice(id, this.ctx(req));
  }

  // ─── Preferences ─────────────────────────────────────────────────────────────

  @Get('notifications/preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notification preferences' })
  getPreferences(@Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.notifications.getPreferences(this.ctx(req));
  }

  @Put('notifications/preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification preferences' })
  updatePreferences(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.notifications.updatePreferences(body, this.ctx(req));
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
