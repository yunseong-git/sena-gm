//길드 관리자용
import { Controller, Post } from '@nestjs/common';
import { GuildQueryService } from '../services/guild-query.service.js';
import { GuildCommandService } from '../services/guild-command.service.js';

@Controller('guild-dev')
export class GuildDevController {
  constructor(
    private readonly guildQueryService: GuildQueryService,
    private readonly guildCommandService: GuildCommandService,
  ) { }


}