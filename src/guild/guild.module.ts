import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './schemas/guild.schema.js';
import { TestUser, TestUserSchema } from '#src/user/schemas/user.schema.js';

//services
import { GuildCommandService } from './services/guild-command.service.js';
import { GuildQueryService } from './services/guild-query.service.js';

//controllers
import { GuildController } from './controllers/guild.controller.js';
import { GuildDevController } from './controllers/guild-dev.controller.js';
import { GuildPublicController } from './controllers/guild-public.controller.js';
import { RedisModule } from '#src/redis/redis.module.js';
import { AuthModule } from '#src/auth/auth.module.js';
import { UserModule } from '#src/user/user.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Guild.name, schema: GuildSchema },
      { name: TestUser.name, schema: TestUserSchema }
    ]),
    RedisModule,
    AuthModule,
    UserModule,
  ],
  controllers: [GuildController, GuildDevController, GuildPublicController],
  providers: [GuildCommandService, GuildQueryService],
})
export class GuildModule { }
