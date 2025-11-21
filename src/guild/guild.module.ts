import { Module } from '@nestjs/common';
//db
import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './schemas/guild.schema.js';
import { User, UserSchema } from '#src/user/user.schema.js';
//services
import { GuildCommandService } from './services/guild-command.service.js';
import { GuildQueryService } from './services/guild-query.service.js';
//controllers
import { GuildCommonController } from './controllers/guild-common.controller.js';
import { GuildManageController } from './controllers/guild-manage.controller.js';
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
  controllers: [GuildCommonController, GuildManageController],
  providers: [GuildCommandService, GuildQueryService],
})
export class GuildModule { }
