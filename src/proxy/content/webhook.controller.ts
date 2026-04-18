import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { ContentClient } from '../../clients/content.client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('webhooks')
@Public()
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly content: ContentClient) {}

  /**
   * POST /webhooks/mux
   *
   * Forwards the raw Mux webhook to the content service, preserving all
   * Mux-Signature headers needed for signature verification.
   */
  @Post('mux')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mux webhook receiver (forwarded to content service)' })
  forwardMuxWebhook(@Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    // Forward the Mux signature headers so the content service can verify them
    const muxHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase().startsWith('mux-') && typeof value === 'string') {
        muxHeaders[key] = value;
      }
    }

    return this.content.forwardMuxWebhook(req.body, muxHeaders, {
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
