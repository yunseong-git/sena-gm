import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { GuildCommandService } from '../services/guild-command.service';
import { CreateGuildDto } from '../dto/create-guild.dto';
import { User } from 'src/common/decorators/user.decorators';
import { TestUserDocument } from 'src/user/schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';
import { simpleResponse } from 'src/common/types/response.type';

export type guildCode = {
  code: string;
}

@Controller('guild-public')
@UseGuards(AuthGuard('jwt')) // 로그인만 필수, 길드 소속은 불필요
export class GuildPublicController {
  constructor(
    private readonly guildCommandService: GuildCommandService,
  ) { }

  //길드 생성
  @Post('create')
  async createGuild(@User() user: TestUserDocument, @Body() dto: CreateGuildDto): Promise<simpleResponse> {
    return await this.guildCommandService.createGuild(dto, user);
  }

  //길드 참여
  @Post('join')
  async joinGuild(@User() user: TestUserDocument, @Body() body: guildCode): Promise<simpleResponse> {
    return await this.guildCommandService.joinGuild(body.code, user);
  }
}