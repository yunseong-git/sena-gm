import { Controller, Get, Post, Body, Patch, Delete, HttpCode, HttpStatus, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { UserDocument } from '#src/user/profile/schemas/user.schema.js';
import { AuthGuard } from '@nestjs/passport';
import { RefreshingDto } from './dto/payload.dto.js';
import { Response } from 'express';
import { RefreshListGuard } from './guards/refresh-list.guard.js';
import { CreateUserDto } from '#src/user/profile/dto/user.dto.js';
import { UserPayload } from './types/payload.type.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('me')
  @UseGuards(RefreshListGuard)
  getMyProfile(@User() user: UserPayload) {
    return user;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto) {
    const createdUser = await this.authService.register(dto);
    return createdUser;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, payload } = await this.authService.login(dto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
      sameSite: 'strict', // CSRF 방어
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
      sameSite: 'strict', // CSRF 방어
      maxAge: 1000 * 60 * 15, // 15분
    });

    return payload
  }

  @Patch('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@User() dto: RefreshingDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, payload } = await this.authService.Refreshing(dto.sub, dto.refreshToken)

    //1. accessToken 쿠키설정하고
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
      sameSite: 'strict', // CSRF 방어
      maxAge: 1000 * 60 * 15, // 15분
    });

    return payload;
  }

  @Delete('logout')
  @UseGuards(RefreshListGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@User() user: UserPayload, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.authService.logout(user.id);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true!
      sameSite: 'strict',
    })
  }
}
