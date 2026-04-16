import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { IdentityModule } from './proxy/identity/identity.module';
import { SocialModule } from './proxy/social/social.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { GatewayThrottlerGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      expandVariables: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttlMs', 60_000),
          limit: config.get<number>('throttle.limit', 100),
        },
      ],
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    ClientsModule,
    IdentityModule,
    SocialModule,
    HealthModule,
  ],
  providers: [
    // JWT auth applied globally — use @Public() to opt out
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Rate limiting applied globally — use @SkipThrottle() to opt out
    { provide: APP_GUARD, useClass: GatewayThrottlerGuard },
  ],
})
export class AppModule {}
