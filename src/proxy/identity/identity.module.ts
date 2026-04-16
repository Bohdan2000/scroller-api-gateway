import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller';
import { ClientsModule } from '../../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [IdentityController],
})
export class IdentityModule {}
