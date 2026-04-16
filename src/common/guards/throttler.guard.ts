import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';

/**
 * Rate-limits by authenticated user ID when available, falls back to IP.
 * This prevents a single user from abusing the API across IPs.
 */
@Injectable()
export class GatewayThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const r = req as unknown as FastifyRequest & { user?: { sub: string } };
    return r.user?.sub ?? r.ip ?? 'anonymous';
  }
}
