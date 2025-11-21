import { Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
//services
import { GuildQueryService } from '../services/guild-query.service.js';
import { GuildCommandService } from '../services/guild-command.service.js';
//decoraters,guards
import { GuildGuard } from '../../common/guards/guild.guard.js';
import { StatePatchGuard } from '#src/common/guards/state-patch.guard.js';
import { Guild_Roles } from '#src/common/decorators/guild-roles.decorator.js';
//others
import { GUILD_ROLE_ENUM } from '../schemas/guild.schema.js';

@ApiTags('Guild - Managements')
@Controller('guild/management')
@UseGuards(StatePatchGuard, GuildGuard) // 컨트롤러 전체에 StatePatchListGuard와 GuildGuard 적용
export class GuildManageController {
  constructor(
    private readonly guildQueryService: GuildQueryService,
    private readonly guildCommandService: GuildCommandService,
  ) { }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER)
  @Patch()
  async setManagers() {

  }
  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Patch()
  async setSubMaster() {

  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER)
  @Post()
  async kickMember() {

  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER)
  @Post()
  async generateCode() {

  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Patch()
  async setMaster() {

  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Post()
  async dissmiss() {

  }
}