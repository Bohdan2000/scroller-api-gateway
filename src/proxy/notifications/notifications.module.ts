import { Module } from '@nestjs/common';
import { ClientsModule } from '../../clients/clients.module';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [ClientsModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
