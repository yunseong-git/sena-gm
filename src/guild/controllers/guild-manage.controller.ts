import { Body, Controller, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
//services
import { UserService } from '#src/user/services/user.service.js';
import { AuthService } from '#src/auth/auth.service.js';

//decoraters,guards
import { Guild_Roles } from '#src/common/decorators/guild-roles.decorator.js';
//others
import { GUILD_ROLE_ENUM } from '../schemas/guild.schema.js';

import { GuildRoleService } from '../services/guild-role.service.js';
import { GuildMemberShipService } from '../services/guild-membership.service.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { UserPayload } from '#src/auth/interfaces/token-payload.interface.js';
import { UpdateRoleDto } from '../dto/update-role.dto.js';
import { Types } from 'mongoose';
import { ACCESS_COOKIE_OPTION } from '#src/common/constatnts/cookie.constant.js';
import type { Response } from 'express';
import { GuildStrictGuard } from '#src/common/guards/guild-strict.guard.js';
import { AuthResponseDto } from '#src/auth/dto/res/auth-res.dto.js';

//타인의 데이터를 건드리는 경우
@ApiTags('Guild - Managements')
@Controller('guild/management')
@UseGuards(GuildStrictGuard) // 컨트롤러 전체에 StatePatchListGuard와 GuildGuard 적용
export class GuildManageController {
  constructor(
    private readonly guildRoleService: GuildRoleService,
    private readonly guildMembershipService: GuildMemberShipService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  @ApiOperation({ summary: '마스터 위임', description: '마스터만 가능하며, 부마스터 대상으로만 가능합니다.' })
  @ApiResponse({ status: 200, description: '마스터 위임 성공', type: AuthResponseDto })
  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Patch('master')
  async setMaster(@User() user: UserPayload, @Body() dto: UpdateRoleDto) {
    const targetId = new Types.ObjectId(dto.targetId)

    await this.guildRoleService.setMaster(user, targetId)
  }

  @ApiOperation({ summary: '매니저 위임', description: '마스터 또는 부마스터만 가능하며, 매니저 대상으로만 가능합니다.' })
  @ApiResponse({ status: 200, description: '부 마스터 위임 성공', type: AuthResponseDto })
  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER)
  @Patch('managers')
  async setManagers(@User() user: UserPayload, @Body() dto: UpdateRoleDto) {
    const targetId = new Types.ObjectId(dto.targetId)

    await this.guildRoleService.setManager(user, targetId)
  }

  @ApiOperation({ summary: '부 마스터 위임', description: '마스터 또는 부마스터만 가능하며, 매니저 대상으로만 가능합니다.' })
  @ApiResponse({ status: 200, description: '부 마스터 위임 성공', type: AuthResponseDto })
  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Patch('submaster')
  async setSubMaster(@User() user: UserPayload, @Body() dto: UpdateRoleDto, @Res({ passthrough: true }) res: Response) {
    const targetId = new Types.ObjectId(dto.targetId)

    await this.guildRoleService.setSubmaster(user, targetId)

    if (user.guildRole === GUILD_ROLE_ENUM.SUBMASTER) {
      const updatedUser = await this.userService.findById(user.id);
      const { accessToken, payload } = await this.authService.issueAccessToken(updatedUser);

      res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);
      return { payload };
    }
  }

  @ApiOperation({ summary: '멤버 추방', description: '마스터만 가능하며, 마스터 제외 전체 대상으로 가능합니다.' })
  @ApiResponse({ status: 200, description: '추방 성공', type: AuthResponseDto })
  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Patch('kick')
  async kickMember(@User() user: UserPayload, @Body() dto: UpdateRoleDto) {
    const targetId = new Types.ObjectId(dto.targetId)

    await this.guildMembershipService.kickMember(user, targetId)
  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER)
  @Post()
  async generateCode() {

  }
}