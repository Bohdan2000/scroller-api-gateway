import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { requestId?: string; user?: { sub: string } }>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();

    const { method, url, requestId, user } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - start;
        this.logger.log(
          `${method} ${url} ${reply.statusCode} ${elapsed}ms | reqId=${requestId ?? '-'} userId=${user?.sub ?? '-'}`,
        );
      }),
    );
  }
}
