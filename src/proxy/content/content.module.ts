import { Module } from '@nestjs/common';
import { ClientsModule } from '../../clients/clients.module';
import { VideosController } from './videos.controller';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [ClientsModule],
  controllers: [VideosController, WebhookController],
})
export class ContentModule {}
