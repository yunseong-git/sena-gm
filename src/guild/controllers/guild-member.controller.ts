import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
//decorators, guards
import { User } from '#src/common/decorators/user.decorators.js';
import { GuildGuard } from '#src/common/guards/guild.guard.js';
import { Guild_Roles } from '#src/common/decorators/guild-roles.decorator.js';
//others
import { UserPayload } from '#src/auth/interfaces/token-payload.interface.js';
import { GUILD_ROLE_ENUM } from '../schemas/guild.schema.js';
import { UserService } from '#src/user/services/user.service.js';
import { AuthService } from '#src/auth/auth.service.js';
import { ACCESS_COOKIE_OPTION } from '#src/common/constatnts/cookie.constant.js';
import type { Response } from 'express';
import { AuthResponseDto } from '#src/auth/dto/res/auth-res.dto.js';
import { GuildLifecycleService } from '../services/guild-lifecycle.service.js';
import { GuildMemberShipService } from '../services/guild-membership.service.js';

@ApiTags('Guild - member')
@UseGuards(GuildGuard)
@Controller('guild')
export class GuildMemberController {
  constructor(
    private readonly guildLifecycleService: GuildLifecycleService,
    private readonly guildMembershipService: GuildMemberShipService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  @ApiOperation({ summary: '길드 해산', description: '마스터만 가능하며, 멤버가 없어야 합니다.' })
  @ApiResponse({ status: 200, description: '해산 성공', type: AuthResponseDto })
  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Delete()
  async dismiss(
    @User() user: UserPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    await this.guildLifecycleService.dismiss(user);

    const updatedUser = await this.userService.findById(user.id);
    const { accessToken, payload } = await this.authService.issueAccessToken(updatedUser);

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);
    return { payload };
  }

  @ApiOperation({ summary: '길드 탈퇴', description: '마스터는 탈퇴 불가' })
  @ApiResponse({ status: 200, description: '탈퇴 성공', type: AuthResponseDto })
  @Guild_Roles(GUILD_ROLE_ENUM.MEMBER, GUILD_ROLE_ENUM.SUBMASTER, GUILD_ROLE_ENUM.MANAGER) //마스터는 탈퇴할수 없음
  @Patch('leave')
  async leave(
    @User() user: UserPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    await this.guildMembershipService.leave(user)

    const updatedUser = await this.userService.findById(user.id);
    const { accessToken, payload } = await this.authService.issueAccessToken(updatedUser);

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);
    return { payload };
  }
}