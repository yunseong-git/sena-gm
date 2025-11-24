import { Module } from '@nestjs/common';
//db
import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './schemas/guild.schema';
//services
import { GuildLifecycleService } from './services/guild-lifecycle.service';
import { GuildMemberShipService } from './services/guild-membership.service';
import { GuildRoleService } from './services/guild-role.service';
import { GuildResourceService } from './services/guild-resource.service';
import { GuildQueryService } from './services/guild-query.service';

//controllers
import { GuildManageController } from './controllers/guild-manage.controller';
import { GuildMemberController } from './controllers/guild-member.controller';
import { GuildPublicController } from './controllers/guild-public.controller';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { UserModule } from '../user/user.module';

//modules

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
