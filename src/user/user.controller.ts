import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service.js';
import { UserDocument } from './schemas/user.schema.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { AddOrUpdateHeroesDto, UpdateHeroEvoDto } from './dto/myheroes.dto.js';
import { CreateUserDto } from './dto/user.dto.js';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const createdUser = await this.userService.createUser(dto);
    return createdUser;
  }

  @Get('my-heroes')
  async getMyHeroes(@User() user: UserDocument) {
    const heroes = await this.userService.getMyHeroes(user.id);
    return {
      message: `${user.nickname}님의 보유 영웅 목록입니다.`,
      heroes: heroes,
    };
  }

  @Patch('my-heroes')
  async addOrUpdateHeroes(@User() user: UserDocument, @Body() dto: AddOrUpdateHeroesDto) {
    await this.userService.addOrUpdateHeroes(user.id, dto);
    return { message: '보유 영웅 정보가 성공적으로 업데이트되었습니다.' };
  }

  @Patch('my-heroes-evo')
  async updateHeroEvolution(@User() user: UserDocument, @Body() dto: UpdateHeroEvoDto) {
    await this.userService.updateHeroEvolution(user.id, dto);
    return { message: '영웅 초월 정보가 업데이트되었습니다.' };
  }
}
