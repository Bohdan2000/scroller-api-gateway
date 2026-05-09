import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { RequestContext } from './identity.client';

@Injectable()
export class NotificationsClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.get<string>('services.notificationsUrl', 'http://localhost:3006/api/v1');
  }

  // ─── Inbox ───────────────────────────────────────────────────────────────────

  async listNotifications(query: string, ctx: RequestContext): Promise<unknown> {
    return this.get(`/notifications${query}`, ctx);
  }

  async markRead(notificationId: string, ctx: RequestContext): Promise<unknown> {
    return this.post(`/notifications/${notificationId}/read`, {}, ctx);
  }

  async markAllRead(ctx: RequestContext): Promise<unknown> {
    return this.post('/notifications/read-all', {}, ctx);
  }

  async ackNotification(notificationId: string, ctx: RequestContext): Promise<unknown> {
    return this.post(`/notifications/${notificationId}/ack`, {}, ctx);
  }

  // ─── Devices ─────────────────────────────────────────────────────────────────

  async registerDevice(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/notifications/devices', body, ctx);
  }

  async deactivateDevice(tokenId: string, ctx: RequestContext): Promise<unknown> {
    return this.patch(`/notifications/devices/${tokenId}/deactivate`, {}, ctx);
  }

  async removeDevice(tokenId: string, ctx: RequestContext): Promise<unknown> {
    return this.delete(`/notifications/devices/${tokenId}`, ctx);
  }

  // ─── Preferences ─────────────────────────────────────────────────────────────

  async getPreferences(ctx: RequestContext): Promise<unknown> {
    return this.get('/notifications/preferences', ctx);
  }

  async updatePreferences(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.put('/notifications/preferences', body, ctx);
  }

  // ─── HTTP helpers ─────────────────────────────────────────────────────────────

  private async get(path: string, ctx: RequestContext): Promise<unknown> {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}${path}`, this.buildConfig(ctx)),
    );
    return data;
  }

  private async post(path: string, body: unknown, ctx: RequestContext): Promise<unknown> {
    const { data } = await firstValueFrom(
      this.http.post(`${this.baseUrl}${path}`, body, this.buildConfig(ctx)),
    );
    return data;
  }

  private async put(path: string, body: unknown, ctx: RequestContext): Promise<unknown> {
    const { data } = await firstValueFrom(
      this.http.put(`${this.baseUrl}${path}`, body, this.buildConfig(ctx)),
    );
    return data;
  }

  private async patch(path: string, body: unknown, ctx: RequestContext): Promise<unknown> {
    const { data } = await firstValueFrom(
      this.http.patch(`${this.baseUrl}${path}`, body, this.buildConfig(ctx)),
    );
    return data;
  }

  private async delete(path: string, ctx: RequestContext): Promise<unknown> {
    const { data } = await firstValueFrom(
      this.http.delete(`${this.baseUrl}${path}`, this.buildConfig(ctx)),
    );
    return data;
  }

  private buildConfig(ctx: RequestContext): AxiosRequestConfig {
    return {
      headers: {
        ...(ctx.authorization && { Authorization: ctx.authorization }),
        'X-Request-Id': ctx.requestId,
        ...(ctx.ip && { 'X-Forwarded-For': ctx.ip }),
        ...(ctx.userAgent && { 'User-Agent': ctx.userAgent }),
      },
    };
  }
}
