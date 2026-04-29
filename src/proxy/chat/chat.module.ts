import { Module } from '@nestjs/common';
import { ClientsModule } from '../../clients/clients.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [ClientsModule],
  controllers: [ChatController],
})
export class ChatModule {}
