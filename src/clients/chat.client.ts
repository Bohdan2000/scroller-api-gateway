import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { RequestContext } from './identity.client';

@Injectable()
export class ChatClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.get<string>('services.chatUrl', 'http://localhost:3005/api/v1');
  }

  issueToken(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/chat/token', body, ctx);
  }

  createDm(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/chat/dm', body, ctx);
  }

  createGroupChannel(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/chat/group-channel', body, ctx);
  }

  getChannels(ctx: RequestContext): Promise<unknown> {
    return this.get('/chat/channels', ctx);
  }

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
