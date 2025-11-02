import { Module } from '@nestjs/common';
//db
import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './schemas/guild.schema.js';
import { User, UserSchema } from '#src/user/profile/schemas/user.schema.js';
//services
import { GuildCommandService } from './services/guild-command.service.js';
import { GuildQueryService } from './services/guild-query.service.js';
//controllers
import { GuildController } from './controllers/guild.controller.js';
import { GuildDevController } from './controllers/guild-dev.controller.js';
import { GuildPublicController } from './controllers/guild-public.controller.js';
//modules
import { RedisModule } from '#src/redis/redis.module.js';
import { AuthModule } from '#src/auth/auth.module.js';
import { UserModule } from '#src/user/user.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Guild.name, schema: GuildSchema },
      { name: User.name, schema: UserSchema }
    ]),
    RedisModule,
    AuthModule,
    UserModule,
  ],
  controllers: [GuildController, GuildDevController, GuildPublicController],
  providers: [GuildCommandService, GuildQueryService],
})
export class GuildModule { }
