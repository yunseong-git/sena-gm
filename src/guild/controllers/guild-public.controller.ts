import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { GuildCommandService } from '../services/guild-command.service.js';
import { CreateGuildDto } from '../dto/create-guild.dto.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { UserDocument } from '#src/user/schemas/user.schema.js';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AccessToken } from '#src/auth/types/token-response.type.js';

export type guildCode = {
  code: string;
}

@Controller('guild/public')
@UseGuards(AuthGuard('jwt')) // 로그인만 필수, 길드 소속은 불필요
export class GuildPublicController {
  constructor(
    private readonly guildCommandService: GuildCommandService,
  ) { }


}