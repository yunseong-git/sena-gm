import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
//services
import { GuildCommandService } from '../services/guild-command.service.js';
//decorators
import { User } from '#src/common/decorators/user.decorators.js';
//types, dtps
import { CreateGuildDto } from '../dto/create-guild.dto.js';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { UserPayload } from '#src/auth/types/payload.type.js';

/**길드가입, 창설 등 public 길드 컨트롤러 */
@Controller('guild/public')
@UseGuards(AuthGuard('jwt')) // 로그인만 필수, 길드 소속은 불필요
export class GuildPublicController {
  constructor(
    private readonly guildCommandService: GuildCommandService,
  ) { }
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createGuild(@User() user: UserPayload, @Body() createGuildDto: CreateGuildDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.guildCommandService.createGuild(createGuildDto, user);
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

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinGuild(@User() user: UserPayload, @Body('code') code: string, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.guildCommandService.joinGuild(code, user);
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

}