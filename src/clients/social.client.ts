import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { RequestContext } from './identity.client';

@Injectable()
export class SocialClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.get<string>('services.socialUrl', 'http://localhost:3002/api/v1');
  }

  // ─── Profile ────────────────────────────────────────────────────────────────

  async getMyProfile(ctx: RequestContext): Promise<unknown> {
    return this.get('/me/profile', ctx);
  }

  async upsertProfile(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.patch('/me/profile', body, ctx);
  }

  async getAvatarUploadUrl(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/me/profile/avatar/upload-url', body, ctx);
  }

  // ─── Onboarding ─────────────────────────────────────────────────────────────

  async getOnboardingStatus(ctx: RequestContext): Promise<unknown> {
    return this.get('/me/onboarding', ctx);
  }

  async completeOnboardingStep1(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.patch('/me/onboarding/step1', body, ctx);
  }

  async completeOnboardingStep2(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/me/onboarding/step2', body, ctx);
  }

  // ─── Public profiles ────────────────────────────────────────────────────────

  async searchProfiles(query: string, ctx: RequestContext): Promise<unknown> {
    return this.get(`/profiles/search${query}`, ctx);
  }

  // ─── Friends ────────────────────────────────────────────────────────────────

  async getFriends(query: string, ctx: RequestContext): Promise<unknown> {
    return this.get(`/friends${query}`, ctx);
  }

  async getFriendRequests(query: string, ctx: RequestContext): Promise<unknown> {
    return this.get(`/friends/requests${query}`, ctx);
  }

  async sendFriendRequest(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/friends/requests', body, ctx);
  }

  async acceptFriendRequest(requestId: string, ctx: RequestContext): Promise<unknown> {
    return this.post(`/friends/requests/${requestId}/accept`, {}, ctx);
  }

  async rejectFriendRequest(requestId: string, ctx: RequestContext): Promise<unknown> {
    return this.post(`/friends/requests/${requestId}/reject`, {}, ctx);
  }

  async removeFriend(profileId: string, ctx: RequestContext): Promise<unknown> {
    return this.delete(`/friends/${profileId}`, ctx);
  }

  // ─── Groups ─────────────────────────────────────────────────────────────────

  async createGroup(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/groups', body, ctx);
  }

  async getGroup(groupId: string, ctx: RequestContext): Promise<unknown> {
    return this.get(`/groups/${groupId}`, ctx);
  }

  async updateGroup(groupId: string, body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.patch(`/groups/${groupId}`, body, ctx);
  }

  async deleteGroup(groupId: string, ctx: RequestContext): Promise<unknown> {
    return this.delete(`/groups/${groupId}`, ctx);
  }

  async getGroupMembers(groupId: string, query: string, ctx: RequestContext): Promise<unknown> {
    return this.get(`/groups/${groupId}/members${query}`, ctx);
  }

  async addGroupMember(groupId: string, body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post(`/groups/${groupId}/members`, body, ctx);
  }

  async updateGroupMember(groupId: string, profileId: string, body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.patch(`/groups/${groupId}/members/${profileId}`, body, ctx);
  }

  async removeGroupMember(groupId: string, profileId: string, ctx: RequestContext): Promise<unknown> {
    return this.delete(`/groups/${groupId}/members/${profileId}`, ctx);
  }

  // ─── Topics ─────────────────────────────────────────────────────────────────

  async listTopics(query: string, ctx: RequestContext): Promise<unknown> {
    return this.get(`/topics${query}`, ctx);
  }

  async setMyTopics(body: unknown, ctx: RequestContext): Promise<unknown> {
    return this.post('/topics/me', body, ctx);
  }

  async getMyTopics(ctx: RequestContext): Promise<unknown> {
    return this.get('/topics/me', ctx);
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
