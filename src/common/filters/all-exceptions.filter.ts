import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest & { requestId?: string }>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      // NestJS exceptions (guards, validation pipe, etc.)
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        message = Array.isArray(r['message'])
          ? (r['message'] as string[]).join('; ')
          : typeof r['message'] === 'string'
            ? r['message']
            : message;
        code = typeof r['code'] === 'string' ? r['code'] : 'HTTP_ERROR';
      } else if (typeof res === 'string') {
        message = res;
        code = 'HTTP_ERROR';
      }
    } else if (axios.isAxiosError(exception)) {
      // Downstream microservice returned an error response
      statusCode = exception.response?.status ?? HttpStatus.BAD_GATEWAY;

      const downstreamBody = exception.response?.data as Record<string, unknown> | undefined;
      if (downstreamBody) {
        message =
          typeof downstreamBody['message'] === 'string'
            ? downstreamBody['message']
            : message;
        code =
          typeof downstreamBody['code'] === 'string'
            ? downstreamBody['code']
            : 'UPSTREAM_ERROR';
      } else {
        message = 'Upstream service error';
        code = 'UPSTREAM_ERROR';
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    reply.status(statusCode).send({
      success: false,
      error: { code, message, statusCode },
      requestId: request.requestId ?? null,
    });
  }
}
