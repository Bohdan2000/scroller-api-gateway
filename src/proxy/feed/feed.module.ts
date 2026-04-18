import { Module } from '@nestjs/common';
import { ClientsModule } from '../../clients/clients.module';
import { FeedController } from './feed.controller';

@Module({
  imports: [ClientsModule],
  controllers: [FeedController],
})
export class FeedModule {}
