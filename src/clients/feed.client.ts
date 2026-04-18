import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { RequestContext } from './identity.client';

@Injectable()
export class FeedClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.get<string>('services.feedUrl', 'http://localhost:3004/api/v1');
  }

  // ─── Feed ────────────────────────────────────────────────────────────────────

  async getFeed(query: Record<string, string>, ctx: RequestContext): Promise<unknown> {
    return this.get('/feed', query, ctx);
  }

  // ─── Events ──────────────────────────────────────────────────────────────────

  async recordImpression(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/feed/events/impression', body, ctx);
  }

  async recordWatch(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/feed/events/watch', body, ctx);
  }

  async likeVideo(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/feed/events/like', body, ctx);
  }

  async unlikeVideo(videoId: string, ctx: RequestContext): Promise<unknown> {
    return this.delete(`/feed/events/like/${videoId}`, ctx);
  }

  async shareVideo(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/feed/events/share', body, ctx);
  }

  // ─── HTTP helpers ─────────────────────────────────────────────────────────

  private async get(
    path: string,
    params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<unknown> {
    const config = this.buildConfig(ctx);
    config.params = params;
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}${path}`, config),
    );
    return data;
  }

  private async post(path: string, body: unknown, ctx: RequestContext): Promise<unknown> {
    const { data } = await firstValueFrom(
      this.http.post(`${this.baseUrl}${path}`, body, this.buildConfig(ctx)),
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
