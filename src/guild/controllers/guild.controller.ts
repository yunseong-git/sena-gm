import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { GuildQueryService } from '../services/guild-query.service.js';
import { GuildCommandService } from '../services/guild-command.service.js';
import { GuildGuard } from '../guards/guild.guard.js';
import { GuildRoles } from '../decorators/guild-roles.decorator.js';
import { Guild, GuildRole } from '../schemas/guild.schema.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { UserDocument } from '#src/user/schemas/user.schema.js';
import { guildCode } from './guild-public.controller.js';
import { simpleResponse } from '#src/common/types/response.type.js';
import { RefreshListGuard } from '#src/auth/guards/refresh-list.guard.js';
import { ParseObjectIdPipe } from '#src/common/pipes/parse-object-id.pipe.js';
import { Types } from 'mongoose';
import { Response } from 'express';
import { AccessToken, Tokens } from '#src/auth/types/token-response.type.js';
import { TargetIdDto } from '../dto/target-id.dto.js';
import { CreateGuildDto } from '../dto/create-guild.dto.js';
import { UserPayload } from '#src/auth/types/payload.type.js';

@Controller('guild')
@UseGuards(RefreshListGuard, GuildGuard) // 컨트롤러 전체에 BlackListGuard와 GuildGuard 적용
export class GuildController {
  constructor(
    private readonly guildQueryService: GuildQueryService,
    private readonly guildCommandService: GuildCommandService,
  ) { }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createGuild(@User() user: UserPayload, @Body() createGuildDto: CreateGuildDto, @Res({ passthrough: true }) res: Response): Promise<AccessToken> {
    const { accessToken, refreshToken } = await this.guildCommandService.createGuild(createGuildDto, user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // JavaScript에서 접근 불가
      secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
      sameSite: 'strict', // CSRF 방어
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일 (밀리초 단위)
    });
    return { accessToken }
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinGuild(@User() user: UserDocument, @Body('code') code: string, @Res({ passthrough: true }) res: Response): Promise<AccessToken> {
    const { accessToken, refreshToken } = await this.guildCommandService.joinGuild(code, user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // JavaScript에서 접근 불가
      secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
      sameSite: 'strict', // CSRF 방어
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일 (밀리초 단위)
    });
    return { accessToken }
  }

  // ==================== 길드 조회 ====================
  @Get('my')
  async getMyGuild(@User() user: UserPayload) {
    return this.guildQueryService.getMyGuild(user);
  }

  // ==================== 멤버 관리 ====================
  @Post('leave')
  @HttpCode(HttpStatus.OK)
  async leaveGuild(@User() user: UserDocument, @Res({ passthrough: true }) res: Response): Promise<AccessToken> {
    const { accessToken, refreshToken } = await this.guildCommandService.leaveGuild(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // JavaScript에서 접근 불가
      secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
      sameSite: 'strict', // CSRF 방어
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일 (밀리초 단위)
    });
    return { accessToken }
  }
}
