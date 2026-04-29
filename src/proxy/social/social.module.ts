import { Module } from '@nestjs/common';
import { ClientsModule } from '../../clients/clients.module';
import { ProfilesController } from './profiles.controller';
import { PublicProfilesController } from './public-profiles.controller';
import { FriendsController } from './friends.controller';
import { GroupsController } from './groups.controller';
import { TopicsController } from './topics.controller';

@Module({
  imports: [ClientsModule],
  controllers: [
    ProfilesController,
    PublicProfilesController,
    FriendsController,
    GroupsController,
    TopicsController,
  ],
})
export class SocialModule {}
