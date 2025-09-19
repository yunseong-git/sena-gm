import { Controller, Post } from '@nestjs/common';
import { GuildService } from './guild.service';

@Controller('guild')
export class GuildController {
  constructor(private readonly guildService: GuildService) {}

  @Post()
  createGuild() {
    return this.guildService.createGuild();
  }
}
