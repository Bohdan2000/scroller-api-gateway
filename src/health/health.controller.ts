import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { Public } from '../common/decorators/public.decorator';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check — gateway + all downstream services' })
  async check(@Res() reply: FastifyReply): Promise<void> {
    const result = await this.healthService.check();
    const statusCode = result.status === 'ok' ? 200 : 503;
    reply.status(statusCode).send(result);
  }
}
