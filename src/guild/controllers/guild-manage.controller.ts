import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
//services
import { UserService } from '#src/user/services/user.service.js';
import { AuthService } from '#src/auth/auth.service.js';
import { GuildResourceService } from '../services/guild-resource.service.js';
import { GuildRoleService } from '../services/guild-role.service.js';
import { GuildMemberShipService } from '../services/guild-membership.service.js';
//dtos
import { UpdateRoleDto } from '../dto/req/update-role.dto.js';
import { UpdateGuildNoticeDto, UpdateGuildTagDto } from '../dto/req/update-guild.dto.js';
import { checkGuildTagResDto, GuildCodeResDto } from '../dto/res/update-guild-res.dto.js';
import { AuthResponseDto } from '#src/auth/dto/res/auth-res.dto.js';
//decoraters,guards
import { User } from '#src/common/decorators/user.decorators.js';
import { Guild_Roles } from '#src/common/decorators/guild-roles.decorator.js';
import { GuildStrictGuard } from '#src/common/guards/guild-strict.guard.js';
//others
import { GUILD_ROLE_ENUM } from '../schemas/guild.schema.js';
import { UserPayload } from '#src/auth/interfaces/token-payload.interface.js';
import { Types } from 'mongoose';
import { ACCESS_COOKIE_OPTION } from '#src/common/constatnts/cookie.constant.js';
import type { Response } from 'express';

/*타인의 데이터를 건드리는 경우(권한변경, 추방), 리소스 변경 컨트롤러*/
@ApiTags('Guild - Managements')
@Controller('guild/management')
@UseGuards(GuildStrictGuard)
export class GuildManageController {
  constructor(
    private readonly guildRoleService: GuildRoleService,
    private readonly guildMembershipService: GuildMemberShipService,
    private readonly guildResourceService: GuildResourceService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  // --- roles ---

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Patch('master')
  @ApiOperation({ summary: '마스터 위임', description: '마스터만 가능하며, 부마스터 대상으로만 가능합니다.' })
  @ApiResponse({ status: 200, description: '마스터 위임 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 (자신에게 위임, 대상이 부마스터 아님)' })
  @ApiResponse({ status: 503, description: '서버 문제로 처리 불가 (Redis)' })
  async setMaster(
    @User() user: UserPayload,
    @Body() dto: UpdateRoleDto,
    @Res({ passthrough: true }) res: Response)
    : Promise<AuthResponseDto> {
    const targetId = new Types.ObjectId(dto.targetId)

    await this.guildRoleService.setMaster(user, targetId)

    const updatedUser = await this.userService.findById(user.id);
    const { accessToken, payload } = await this.authService.issueAccessToken(updatedUser);

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);
    return { payload };
  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER)
  @Patch('managers')
  @ApiOperation({ summary: '매니저 위임', description: '마스터 또는 부마스터만 가능하며, 매니저 대상으로만 가능합니다.' })
  @ApiResponse({ status: 200, description: '매니저 임명 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 (타길드원, 이미 임원진)' })
  @ApiResponse({ status: 404, description: '길드가 없거나 매니저 정원 초과' })
  @ApiResponse({ status: 503, description: '서버 문제로 처리 불가 (Redis)' })
  async setManagers(
    @User() user: UserPayload,
    @Body() dto: UpdateRoleDto)
    : Promise<void> {
    const targetId = new Types.ObjectId(dto.targetId)

    await this.guildRoleService.setManager(user, targetId)
  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Patch('submaster')
  @ApiOperation({ summary: '부 마스터 위임', description: '마스터 또는 부마스터만 가능하며, 매니저 대상으로만 가능합니다.' })
  @ApiResponse({ status: 200, description: '위임 성공', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 (자신에게 위임, 대상이 매니저 아님)' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '길드를 찾을 수 없음' })
  @ApiResponse({ status: 503, description: '서버 문제로 처리 불가 (Redis)' })
  async setSubMaster(
    @User() user: UserPayload,
    @Body() dto: UpdateRoleDto,
    @Res({ passthrough: true }) res: Response)
    : Promise<AuthResponseDto> {
    const targetId = new Types.ObjectId(dto.targetId)

    await this.guildRoleService.setSubmaster(user, targetId)

    const updatedUser = await this.userService.findById(user.id);
    const { accessToken, payload } = await this.authService.issueAccessToken(updatedUser);

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);
    return { payload };
  }

  @ApiOperation({ summary: '멤버 추방', description: '마스터만 가능하며, 마스터 제외 전체 대상으로 가능합니다.' })
  @ApiResponse({ status: 200, description: '길드원 추방 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 (자신/타길드원/마스터 추방 시도)' })
  @ApiResponse({ status: 403, description: '추방 권한 없음' })
  @ApiResponse({ status: 404, description: '길드 정보를 찾을 수 없음' })
  @ApiResponse({ status: 503, description: '서버 문제로 처리 불가 (Redis)' })
  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Patch('kick')
  async kickMember(
    @User() user: UserPayload,
    @Body() dto: UpdateRoleDto)
    : Promise<void> {
    const targetId = new Types.ObjectId(dto.targetId)

    await this.guildMembershipService.kickMember(user, targetId)
  }

  // --- code --- 

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER)
  @Get('code')
  @ApiOperation({ summary: '초대 코드 조회' })
  @ApiResponse({ status: 200, description: '코드 조회 성공', type: GuildCodeResDto })
  @ApiResponse({ status: 404, description: '길드가 없거나 코드가 없음' })
  async getCode(@User() user: UserPayload)
    : Promise<GuildCodeResDto> {
    return await this.guildResourceService.getCode(user);
  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER)
  @Patch('code')
  @ApiOperation({ summary: '초대 코드 재생성', description: '기존 코드를 만료시키고 새 코드를 발급합니다.' })
  @ApiResponse({ status: 200, description: '코드 갱신 성공', type: GuildCodeResDto })
  @ApiResponse({ status: 409, description: '코드 생성 충돌 (재시도 필요)' })
  async updateCode(@User() user: UserPayload)
    : Promise<GuildCodeResDto> {
    return await this.guildResourceService.updateCode(user); // generate -> updateCode로 이름 통일 추천
  }

  // --- other resources ---
  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Post('tag')
  @ApiOperation({ summary: '태그 중복확인', description: '중복이면 isExist: true를 반환합니다.' })
  @ApiResponse({ status: 200, description: '태그 변경 성공' })
  @ApiResponse({ status: 404, description: '길드 정보를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 사용 중인 태그' })
  @HttpCode(HttpStatus.OK) //200대신 201
  async checkTagDuplicate(
    @User() user: UserPayload,
    @Body() dto: UpdateGuildTagDto)
    : Promise<checkGuildTagResDto> {
    return await this.guildResourceService.checkTagDuplicate(user, dto.tag);
  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER)
  @Patch('check-tag')
  @ApiOperation({ summary: '태그 변경', description: '길드 태그를 변경합니다. (중복 시 에러)' })
  @ApiResponse({ status: 200, description: '변경 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 태그' })
  async updateTag(
    @User() user: UserPayload,
    @Body() dto: UpdateGuildTagDto)
    : Promise<void> {
    await this.guildResourceService.updateTag(user, dto);
  }

  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER)
  @Patch('notice')
  @ApiOperation({ summary: '공지사항 변경' })
  @ApiResponse({ status: 200, description: '공지사항 수정 성공' })
  @ApiResponse({ status: 404, description: '길드 정보를 찾을 수 없음' })
  async updateNotice(
    @User() user: UserPayload,
    @Body() dto: UpdateGuildNoticeDto)
    : Promise<void> {
    await this.guildResourceService.updateNotice(user, dto);
  }
}