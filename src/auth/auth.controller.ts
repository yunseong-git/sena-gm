import { Controller, Get, Post, Body, Patch, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { TestUserDocument } from '#src/user/schemas/user.schema.js';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenPayload } from './dto/payload.dto.js';
import { Tokens, AccessToken } from './types/token-response.type.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<TestUserDocument> {
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<Tokens> {
    return this.authService.login(dto);
  }

  @Patch('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@User() payload: RefreshTokenPayload): Promise<AccessToken> {
    return this.authService.Refreshing(payload.sub, payload.refreshToken);
  }

  @Delete('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(@User() user: TestUserDocument): Promise<void> {
    return this.authService.logout(user._id.toString());
  }
}
