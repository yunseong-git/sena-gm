import { Controller, Delete, Get, Patch, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
//services
import { UserService } from '#src/user/services/user.service.js';
import { AuthService } from '#src/auth/auth.service.js';
import { GuildLifecycleService } from '../services/guild-lifecycle.service.js';
import { GuildMemberShipService } from '../services/guild-membership.service.js';
import { GuildQueryService } from '../services/guild-query.service.js';
//dtos
import { AuthResponseDto } from '#src/auth/dto/res/auth-res.dto.js';
import { GuildMemberResDto } from '../dto/res/get-members-res.dto.js';
import { SimpleGuildResDto } from '../dto/res/get-guild-res.dto.js';
//decorators, guards
import { User } from '#src/common/decorators/user.decorators.js';
import { GuildGuard } from '#src/common/guards/guild.guard.js';
import { Guild_Roles } from '#src/common/decorators/guild-roles.decorator.js';
//others
import { UserPayload } from '#src/auth/interfaces/token-payload.interface.js';
import { GUILD_ROLE_ENUM } from '../schemas/guild.schema.js';
import { ACCESS_COOKIE_OPTION } from '#src/common/constatnts/cookie.constant.js';
import type { Response } from 'express';

/** 길드의 기본적인 작업 컨트롤러 */
@ApiTags('Guild - member')
@UseGuards(GuildGuard)
@Controller('guild')
export class GuildMemberController {
  constructor(
    private readonly guildLifecycleService: GuildLifecycleService,
    private readonly guildMembershipService: GuildMemberShipService,
    private readonly guildQueryService: GuildQueryService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  @Get()
  @ApiOperation({ summary: '길드 기본정보 쿼리' })
  @ApiResponse({ status: 200, description: '길드 정보 조회 성공', type: SimpleGuildResDto })
  @ApiResponse({ status: 404, description: '길드를 찾을 수 없음' })
  async get(
    @User() user: UserPayload)
    : Promise<SimpleGuildResDto> {
    return await this.guildQueryService.getById(user)
  }

  @Get('members')
  @ApiOperation({ summary: '길드 멤버정보 쿼리' })
  @ApiResponse({ status: 200, description: '길드원 목록 조회 성공', type: [GuildMemberResDto] })
  @ApiResponse({ status: 404, description: '길드를 찾을 수 없음' })
  async getMembers(
    @User() user: UserPayload)
    : Promise<GuildMemberResDto[]> {
    return await this.guildQueryService.getMembers(user)
  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Delete()
  @ApiOperation({ summary: '길드 해산', description: '마스터만 가능하며, 멤버가 없어야 합니다.' })
  @ApiResponse({ status: 200, description: '길드 해산 성공', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '다른 길드원이 남아있어 해산 불가' })
  @ApiResponse({ status: 404, description: '길드가 없거나 권한이 없음' })
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

  @Guild_Roles(GUILD_ROLE_ENUM.MEMBER, GUILD_ROLE_ENUM.SUBMASTER, GUILD_ROLE_ENUM.MANAGER) //마스터는 탈퇴할수 없음
  @Patch('leave')
  @ApiOperation({ summary: '길드 탈퇴', description: '마스터는 탈퇴 불가' })
  @ApiResponse({ status: 200, description: '길드 탈퇴 성공', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '길드 마스터는 탈퇴 불가' })
  @ApiResponse({ status: 404, description: '길드 정보를 찾을 수 없음' })
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