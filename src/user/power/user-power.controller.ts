import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '#src/common/decorators/user.decorators.js';
import { AddOrUpdateHeroesDto, AddOrUpdateRingsDto } from './dto/update-user-power.dto.js';
import { UserPayload } from '#src/auth/types/payload.type.js';
import { UserPowerService } from './user-power.service.js';

@UseGuards(AuthGuard('jwt'))
@Controller('user/power')
export class UserPowerController {
  constructor(private readonly userPowerService: UserPowerService) { }

  //전체보여줌, 클라이언트가 알아서 하셈
  @Get()
  async getMyPower(@User() user: UserPayload) {

  }

  //반지정보수정
  @Patch('rings')
  async updateMyRings(@User() user: UserPayload) {

  }

  //영웅정보수정
  @Patch('heroes')
  async updateMyHeroes(@User() user: UserPayload) {

  }

  //공유여부수정
  @Patch('open-flag')
  async updateOpenFlag(@User() user: UserPayload) {

  }
}
