import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './schemas/guild.schema';
import { TestUser, TestUserSchema } from 'src/user/schemas/user.schema';

//services
import { GuildCommandService } from './services/guild-command.service';
import { GuildQueryService } from './services/guild-query.service';

//controllers
import { GuildController } from './controllers/guild.controller';
import { GuildDevController } from './controllers/guild-dev.controller';
import { GuildPublicController } from './controllers/guild-public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Guild.name, schema: GuildSchema },
      { name: TestUser.name, schema: TestUserSchema }
    ]),
  ],
  controllers: [GuildController, GuildDevController, GuildPublicController],
  providers: [GuildCommandService, GuildQueryService],
})
export class GuildModule { }
