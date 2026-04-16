import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IdentityClient } from './identity.client';
import { SocialClient } from './social.client';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 0,
    }),
  ],
  providers: [IdentityClient, SocialClient],
  exports: [IdentityClient, SocialClient],
})
export class ClientsModule {}
