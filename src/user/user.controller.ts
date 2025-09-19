import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateMyHeroesDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Patch()
  async updateUserHeroes(@Body() dto: UpdateMyHeroesDto) {
    await this.userService.UpdateMyHeroes(dto);

    return { success: true }; // 성공 여부나 간단한 메시지 반환
  }
}
