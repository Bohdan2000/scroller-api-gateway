import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { RequestContext } from './identity.client';

@Injectable()
export class ContentClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.get<string>('services.contentUrl', 'http://localhost:3003/api/v1');
  }

  // ─── Videos ─────────────────────────────────────────────────────────────────

  async createVideo(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/videos', body, ctx);
  }

  async getVideo(videoId: string, ctx: RequestContext): Promise<unknown> {
    return this.get(`/videos/${videoId}`, ctx);
  }

  async updateVideo(videoId: string, body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.patch(`/videos/${videoId}`, body, ctx);
  }

  async deleteVideo(videoId: string, ctx: RequestContext): Promise<unknown> {
    return this.delete(`/videos/${videoId}`, ctx);
  }

  async requestUploadUrl(videoId: string, body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post(`/videos/${videoId}/upload-url`, body, ctx);
  }

  async publishVideo(videoId: string, ctx: RequestContext): Promise<unknown> {
    return this.post(`/videos/${videoId}/publish`, {}, ctx);
  }

  async unpublishVideo(videoId: string, ctx: RequestContext): Promise<unknown> {
    return this.post(`/videos/${videoId}/unpublish`, {}, ctx);
  }

  async getMyVideos(ctx: RequestContext): Promise<unknown> {
    return this.get('/me/videos', ctx);
  }

  // ─── Webhooks ────────────────────────────────────────────────────────────────

  async forwardMuxWebhook(body: unknown, headers: Record<string, string>, ctx: RequestContext): Promise<unknown> {
    return this.postWithHeaders('/webhooks/mux', body, headers, ctx);
  }

  // ─── HTTP helpers ────────────────────────────────────────────────────────────

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

  private async postWithHeaders(
    path: string,
    body: unknown,
    extraHeaders: Record<string, string>,
    ctx: RequestContext,
  ): Promise<unknown> {
    const config = this.buildConfig(ctx);
    config.headers = { ...config.headers, ...extraHeaders };
    const { data } = await firstValueFrom(
      this.http.post(`${this.baseUrl}${path}`, body, config),
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
