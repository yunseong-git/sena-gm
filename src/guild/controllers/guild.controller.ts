import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { GuildQueryService } from '../services/guild-query.service';
import { GuildCommandService } from '../services/guild-command.service';
import { GuildGuard } from '../guards/guild.guard';
import { GuildRoles } from '../decorators/guild-roles.decorator';
import { GuildRole } from '../schemas/guild.schema';
import { User } from 'src/common/decorators/user.decorators';
import { TestUserDocument } from 'src/user/schemas/user.schema';
import { guildCode } from './guild-public.controller';
import { simpleResponse } from 'src/common/types/response.type';
import { JwtBlacklistGuard } from 'src/auth/guards/auth.guard';

@Controller('guild')
@UseGuards(JwtBlacklistGuard, GuildGuard) // 컨트롤러 전체에 BlackListGuard와 GuildGuard 적용
export class GuildController {
  constructor(
    private readonly guildQueryService: GuildQueryService,
    private readonly guildCommandService: GuildCommandService,
  ) { }

  /** 길드 해체 */
  @Delete('dismiss')
  @GuildRoles(GuildRole.MASTER)
  async dismissGuild(@User() user: TestUserDocument): Promise<simpleResponse> {
    return await this.guildCommandService.dismissGuild(user);
  }

  ////////////////////////////////roles////////////////////////////////

  /** 길드 마스터 위임 */
  @Post('transfer-master')
  @GuildRoles(GuildRole.MASTER)
  async transferMaster(@User() user: TestUserDocument, @Body() target_Id: string,): Promise<simpleResponse> {
    return await this.guildCommandService.transferMaster(user, target_Id);
  }

  /** 길드 부마스터 임명(최초 1회) */
  @Post('appoint-submaster')
  @GuildRoles(GuildRole.MASTER)
  async appointSubmaster(@User() user: TestUserDocument, @Body() target_Id: string): Promise<simpleResponse> {
    return await this.guildCommandService.appointSubmaster(user, target_Id);
  }

  /** 길드 부마스터 위임 */
  @Post('transfer-submaster')
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async transferSubmaster(@User() user: TestUserDocument, @Body() target_Id: string): Promise<simpleResponse> {
    return await this.guildCommandService.transferSubmaster(user, target_Id);
  }
  ////////////////////////////////members////////////////////////////////

  //길드 추방
  @Patch('kick')
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async kickMember(@User() user: TestUserDocument, @Body() target_Id: string): Promise<simpleResponse> {
    return await this.guildCommandService.kickMember(user, target_Id);
  }

  //길드 탈퇴
  @Patch('leave')
  async leaveGuild(@User() user: TestUserDocument): Promise<simpleResponse> {
    return await this.guildCommandService.leaveGuild(user);
  }

  ////////////////////////////////guild-code////////////////////////////////

  //코드 생성 후 코드반환
  @Patch('code')
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async GenerateCode(@User() user: TestUserDocument): Promise<guildCode> {
    const guild_Id = user.guild!._id.toString();
    return await this.guildCommandService.generateGuildCode(guild_Id);
  }

  //코드 조회
  @Get('code')
  @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
  async findGuildCode(@User() user: TestUserDocument): Promise<guildCode> {
    const guild_Id = user.guild!._id.toString();
    return await this.guildQueryService.findGuildCode(guild_Id);
  }
}
