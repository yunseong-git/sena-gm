import { Module } from '@nestjs/common';
//db
import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './schemas/guild.schema.js';
//services
import { GuildLifecycleService } from './services/guild-lifecycle.service.js';
import { GuildMemberShipService } from './services/guild-membership.service.js';
import { GuildRoleService } from './services/guild-role.service.js';
import { GuildResourceService } from './services/guild-resource.service.js';
import { GuildQueryService } from './services/guild-query.service.js';

//controllers
import { GuildManageController } from './controllers/guild-manage.controller.js';
import { GuildMemberController } from './controllers/guild-member.controller.js';
import { GuildPublicController } from './controllers/guild-public.controller.js';

//modules
import { RedisModule } from '#src/redis/redis.module.js';
import { AuthModule } from '#src/auth/auth.module.js';
import { UserModule } from '#src/user/user.module.js';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Guild.name, schema: GuildSchema },
    ]),
    RedisModule,
    AuthModule,
    UserModule,
  ],
  controllers: [
    GuildManageController,
    GuildMemberController,
    GuildPublicController
  ],
  providers: [
    GuildQueryService,
    GuildResourceService,
    GuildLifecycleService,
    GuildRoleService,
    GuildMemberShipService
  ],
})
export class GuildModule { }
