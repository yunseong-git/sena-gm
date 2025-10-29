import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Res, UseGuards } from '@nestjs/common';
//services
import { GuildQueryService } from '../services/guild-query.service.js';
import { GuildCommandService } from '../services/guild-command.service.js';
//guards
import { GuildGuard } from '../guards/guild.guard.js';
import { RefreshListGuard } from '#src/auth/guards/refresh-list.guard.js';
//decoraters
import { User } from '#src/common/decorators/user.decorators.js';
import { GuildRoles } from '../decorators/guild-roles.decorator.js';
//types, dtos
import { Response } from 'express';
import { UserPayload } from '#src/auth/types/payload.type.js';
import { GuildMemberBasicInfo, GuildMemberDetailInfo } from '../types/guild-member.type.js';
import { TargetIdDto } from '../dto/target-id.dto.js';
import { guildCode } from '../types/guild.type.js';
import { Tokens } from '#src/auth/types/token-response.type.js';
import { GuildRole } from '../schemas/guild.schema.js';


/**길드를 가입한 상태에서 사용하는 컨트롤러 */
@Controller('guild')
@UseGuards(RefreshListGuard, GuildGuard) // 컨트롤러 전체에 BlackListGuard와 GuildGuard 적용
export class GuildController {
  constructor(
    private readonly guildQueryService: GuildQueryService,
    private readonly guildCommandService: GuildCommandService,
  ) { }

  // ==================== 길드 조회 ====================
  @Get()
  async getMyGuild(@User() user: UserPayload) {
    return await this.guildQueryService.findMyGuild(user.guildId!);
  }

  @Get('members')
  async getMyGuildMembers(@User() user: UserPayload): Promise<GuildMemberBasicInfo[]> {
    return await this.guildQueryService.findMyGuildMembers(user.guildId!);
  }

  @Get('members/detail')
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async getGuildPower(@User() user: UserPayload): Promise<GuildMemberDetailInfo[]> {
    return await this.guildQueryService.getMemberDetails(user.guildId!);
  }

  // ==================== 길드 정보 변경 ====================

  @Delete('leave')
  @HttpCode(HttpStatus.OK)
  async leaveGuild(@User() user: UserPayload, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.guildCommandService.leaveGuild(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, //7일
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, //15분
    });
  }

  // ==================== 길드 관리 ====================

  @Post('kick')
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  @HttpCode(HttpStatus.OK)
  async kickMember(@User() user: UserPayload, @Body() dto: TargetIdDto,) {
    return await this.guildCommandService.kickMember(user, dto.targetId);
  }

  @Delete('dismiss')
  @GuildRoles(GuildRole.MASTER)
  @HttpCode(HttpStatus.OK)
  async dismissGuild(@User() user: UserPayload, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.guildCommandService.dismissGuild(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // JavaScript에서 접근 불가
      secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
      sameSite: 'strict', // CSRF 방어
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일 (밀리초 단위)
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, //15분
    });
  }
  // ==================== 권한 변경 ====================

  @Post('master/transfer')
  @GuildRoles(GuildRole.MASTER)
  async transferMaster(@User() user: UserPayload, @Body() dto: TargetIdDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.guildCommandService.transferMaster(user, dto.targetId);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // JavaScript에서 접근 불가
      secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
      sameSite: 'strict', // CSRF 방어
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일 (밀리초 단위)
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, //15분
    });
  }

  @Post('submaster')
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async setSubmaster(@User() user: UserPayload, @Body() dto: TargetIdDto, @Res({ passthrough: true }) res: Response) {
    const actorRole = user.guildRole;
    const result = await this.guildCommandService.setSubmaster(user, dto.targetId);

    //액터가 submaster면 토큰 재발행
    if (actorRole === GuildRole.SUBMASTER) {
      const { accessToken, refreshToken } = result as Tokens;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // 로컬 개발 환경
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 15, //15분
      });
    }
  }
  // ==================== 초대 코드 관리 ====================
  @Get('code')
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async findGuildCode(@User() user: UserPayload): Promise<guildCode> {
    return this.guildQueryService.findGuildCode(user.guildId!);
  }

  @Patch('code')
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async generateCode(@User() user: UserPayload): Promise<guildCode> {
    return this.guildCommandService.generateGuildCode(user.guildId!);
  }
}
