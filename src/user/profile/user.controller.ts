import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service.js';
import { UserDocument } from './schemas/user.schema.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { CreateUserDto } from './dto/user.dto.js';
import { UserPayload } from '#src/auth/types/payload.type.js';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const createdUser = await this.userService.createUser(dto);
    return createdUser;
  }

  @Get('profil')
  async getUser(@User() user: UserPayload) {
    const result = await this.userService.getUserProfil(user.id);
    return result;
  }

}
