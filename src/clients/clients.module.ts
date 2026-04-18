import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IdentityClient } from './identity.client';
import { SocialClient } from './social.client';
import { ContentClient } from './content.client';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 0,
    }),
  ],
  providers: [IdentityClient, SocialClient, ContentClient],
  exports: [IdentityClient, SocialClient, ContentClient],
})
export class ClientsModule {}
