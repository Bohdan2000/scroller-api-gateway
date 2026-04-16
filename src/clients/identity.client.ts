import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

export interface RequestContext {
  requestId: string;
  authorization?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class IdentityClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.get<string>('services.identityUrl', 'http://localhost:3001/api/v1');
  }

  async signUp(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/auth/sign-up', body, ctx);
  }

  async signIn(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/auth/sign-in', body, ctx);
  }

  async refresh(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/auth/refresh', body, ctx);
  }

  async logout(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/auth/logout', body, ctx);
  }

  async oauthGoogle(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/auth/oauth/google', body, ctx);
  }

  async oauthApple(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/auth/oauth/apple', body, ctx);
  }

  async getMe(ctx: RequestContext): Promise<unknown> {
    return this.get('/me', ctx);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async post(path: string, body: unknown, ctx: RequestContext): Promise<unknown> {
    const { data } = await firstValueFrom(
      this.http.post(`${this.baseUrl}${path}`, body, this.buildConfig(ctx)),
    );
    return data;
  }

  private async get(path: string, ctx: RequestContext): Promise<unknown> {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}${path}`, this.buildConfig(ctx)),
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
