import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IdentityClient } from './identity.client';
import { SocialClient } from './social.client';
import { ContentClient } from './content.client';
import { FeedClient } from './feed.client';
import { ChatClient } from './chat.client';
import { NotificationsClient } from './notifications.client';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 0,
    }),
  ],
  providers: [IdentityClient, SocialClient, ContentClient, FeedClient, ChatClient, NotificationsClient],
  exports: [IdentityClient, SocialClient, ContentClient, FeedClient, ChatClient, NotificationsClient],
})
export class ClientsModule {}
