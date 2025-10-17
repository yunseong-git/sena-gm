import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { GuildCommandService } from '../services/guild-command.service.js';
import { CreateGuildDto } from '../dto/create-guild.dto.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { TestUserDocument } from '#src/user/schemas/user.schema.js';
import { AuthGuard } from '@nestjs/passport';
import { simpleResponse } from '#src/common/types/response.type.js';
import { Tokens } from '#src/auth/types/token-response.type.js';

export type guildCode = {
  code: string;
}

@Controller('guild-public')
@UseGuards(AuthGuard('jwt')) // 로그인만 필수, 길드 소속은 불필요
export class GuildPublicController {
  constructor(
    private readonly guildCommandService: GuildCommandService,
  ) { }

  /**
     * 길드 생성
     * @description 로그인한 유저가 새로운 길드를 생성합니다.
     * @returns {Tokens} 최신 정보가 담긴 새로운 토큰 세트
     */
  @Post('create')
  async createGuild(@User() user: TestUserDocument, @Body() createGuildDto: CreateGuildDto,): Promise<Tokens> {
    return this.guildCommandService.createGuild(createGuildDto, user);
  }

  /**
   * 길드 가입
   * @description 초대 코드를 사용하여 길드에 가입합니다.
   * @returns {Tokens} 최신 정보가 담긴 새로운 토큰 세트
   */
  @Post('join')
  async joinGuild(@User() user: TestUserDocument, @Body() code: string,): Promise<Tokens> {
    return this.guildCommandService.joinGuild(code, user);
  }
}
