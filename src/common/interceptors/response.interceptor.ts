import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { FastifyRequest } from 'fastify';

export interface ApiResponse<T> {
  success: true;
  data: T;
  requestId: string;
}

/**
 * Wraps every successful HTTP response in a standard envelope:
 * { success: true, data: T, requestId: string }
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { requestId?: string }>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        requestId: request.requestId ?? null,
      })),
    );
  }
}
