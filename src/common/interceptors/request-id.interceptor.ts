import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Generates a unique request ID for every inbound request.
 * Uses the client-supplied X-Request-Id header if present (useful for
 * end-to-end tracing from the mobile app), otherwise generates a UUID.
 * The ID is attached to the request object and echoed in the response header.
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest<FastifyRequest & { requestId: string }>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();

    const requestId =
      (request.headers[REQUEST_ID_HEADER] as string | undefined) ?? uuidv4();

    request.requestId = requestId;
    void reply.header(REQUEST_ID_HEADER, requestId);

    return next.handle();
  }
}
