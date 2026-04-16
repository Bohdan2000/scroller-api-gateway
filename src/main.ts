import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  app.setGlobalPrefix('api/v1');

  // Order matters: RequestId first so every subsequent layer can read the ID
  app.useGlobalInterceptors(
    new RequestIdInterceptor(),
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  // Single catch-all filter — handles HttpException, AxiosError, and unknown errors
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Scroller API Gateway')
      .setDescription('Single entry point for the Scroller mobile app.')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token',
      )
      .addTag('auth', 'Authentication & session management')
      .addTag('profiles', 'User profiles & onboarding')
      .addTag('friends', 'Friendships & requests')
      .addTag('groups', 'Groups & membership')
      .addTag('topics', 'Topic catalogue & preferences')
      .addTag('health', 'Service health')
      .build(),
  );

  await app.register(require('@fastify/static'), {
    root: require('path').join(
      require.resolve('@nestjs/swagger/package.json'),
      '..',
      'dist',
      'swagger-ui',
    ),
    prefix: '/swagger-ui',
    decorateReply: false,
  });

  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.enableShutdownHooks();

  const port = app.get(ConfigService).get<number>('port', 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
