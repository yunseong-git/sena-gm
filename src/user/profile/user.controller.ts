import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from '../services/user.service.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

}
