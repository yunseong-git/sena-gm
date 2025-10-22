import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { GuildQueryService } from '../services/guild-query.service.js';
import { GuildCommandService } from '../services/guild-command.service.js';
import { GuildGuard } from '../guards/guild.guard.js';
import { GuildRoles } from '../decorators/guild-roles.decorator.js';
import { GuildRole } from '../schemas/guild.schema.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { TestUserDocument } from '#src/user/schemas/user.schema.js';
import { guildCode } from './guild-public.controller.js';
import { simpleResponse } from '#src/common/types/response.type.js';
import { JwtBlacklistGuard } from '#src/auth/guards/jwt-blacklist.guard.js';
import { ParseObjectIdPipe } from '#src/common/pipes/parse-object-id.pipe.js';
import { Types } from 'mongoose';
import { Tokens } from '#src/auth/types/token-response.type.js';
import { TargetIdDto } from '../dto/target-id.dto.js';

@Controller('guild')
@UseGuards(JwtBlacklistGuard, GuildGuard) // 컨트롤러 전체에 BlackListGuard와 GuildGuard 적용
export class GuildController {
  constructor(
    private readonly guildQueryService: GuildQueryService,
    private readonly guildCommandService: GuildCommandService,
  ) { }

  // ==================== 길드 관리 ====================

  @Delete() // DELETE /guilds
  @GuildRoles(GuildRole.MASTER)
  async dismissGuild(@User() user: TestUserDocument): Promise<Tokens> {
    return this.guildCommandService.dismissGuild(user);
  }

  // ==================== 멤버 관리 ====================

  @Post('kick') // POST /guilds/kick
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  @HttpCode(HttpStatus.OK)
  async kickMember(@User() user: TestUserDocument, @Body() dto: TargetIdDto,): Promise<simpleResponse> {
    return this.guildCommandService.kickMember(user, dto.targetId);
  }

  @Post('leave') // POST /guilds/leave
  @HttpCode(HttpStatus.OK)
  async leaveGuild(@User() user: TestUserDocument): Promise<Tokens> {
    return this.guildCommandService.leaveGuild(user);
  }

  // ==================== 역할 관리 ====================

  @Post('master/transfer') // POST /guilds/master/transfer
  @GuildRoles(GuildRole.MASTER)
  async transferMaster(@User() user: TestUserDocument, @Body() dto: TargetIdDto,): Promise<Tokens> {
    return this.guildCommandService.transferMaster(user, dto.targetId);
  }

  @Post('submaster') // POST /guilds/submaster
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async setSubmaster(@User() user: TestUserDocument, @Body() dto: TargetIdDto,): Promise<Tokens | simpleResponse> {
    return this.guildCommandService.setSubmaster(user, dto.targetId);
  }

  // ==================== 초대 코드 관리 ====================

  @Patch('code') // PATCH /guilds/code
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async generateCode(@User() user: TestUserDocument): Promise<guildCode> {

    console.log(`[CONTROLLER] User's payload from token: ${user}`);

    return this.guildCommandService.generateGuildCode(user.guild!.guildId);
  }

  @Get('code') // GET /guilds/code
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async findGuildCode(@User() user: TestUserDocument): Promise<guildCode> {


    return this.guildQueryService.findGuildCode(user.guild!.guildId);
  }
}
