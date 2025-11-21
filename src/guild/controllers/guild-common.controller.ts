import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
//services
import { GuildCommandService } from '../services/guild-command.service.js';
import { GuildQueryService } from '../services/guild-query.service.js';
//decorators, guards
import { User } from '#src/common/decorators/user.decorators.js';
import { GuildGuard } from '#src/common/guards/guild.guard.js';
import { Guild_Roles } from '#src/common/decorators/guild-roles.decorator.js';
//dtos
import { CreateGuildDto } from '../dto/create-guild.dto.js';
import { JoinGuildDto } from '../dto/req/join-guild.dto.js';
//others
import { UserPayload } from '#src/auth/interfaces/token-payload.interface.js';
import { Guild, GUILD_ROLE_ENUM } from '../schemas/guild.schema.js';

@ApiTags('Guild - common')
@Controller('guild')
export class GuildCommonController {
  constructor(
    private readonly guildCommandService: GuildCommandService,
    private readonly guildQueryService: GuildQueryService,
  ) { }

  //--- for public ---
  @Post()
  @ApiOperation({ summary: '길드 생성' })
  @ApiResponse({ status: 201, description: '길드 생성 성공' })
  async create(@User() user: UserPayload, @Body() dto: CreateGuildDto) {
    return this.guildCommandService.create(user, dto);
  }

  @Post('join')
  @ApiOperation({ summary: '길드 가입', description: '초대 코드를 통해 길드에 가입합니다.' })
  @ApiResponse({ status: 201, description: '가입 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 코드' })
  @ApiResponse({ status: 409, description: '이미 길드 가입됨 / 정원 초과' })
  async join(@User() user: UserPayload, @Body() dto: JoinGuildDto) {
    return this.guildCommandService.join(user, dto);
  }

  // --- for members ---
  @UseGuards(GuildGuard)
  @Guild_Roles()
  @Get() //뭐 길드 전체 정보 조회
  async getGuildInfo() {

  }

  @UseGuards(GuildGuard)
  @Guild_Roles()
  @Get('members') // 길드 유저 populate 조회
  async getMembers() {

  }

  @UseGuards(GuildGuard)
  @Guild_Roles(GUILD_ROLE_ENUM.MEMBER, GUILD_ROLE_ENUM.SUBMASTER, GUILD_ROLE_ENUM.MANAGER) //마스터는 탈퇴할수 없음
  @Delete('leave')
  async leaveGuild(@User() user: UserPayload) {
  }
}