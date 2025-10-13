import { Controller, Get, Post, Body, Patch, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/common/decorators/user.decorators';
import { TestUserDocument } from 'src/user/schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenPayload } from './dto/payload.dto';
import { Tokens, AccessToken } from './types/token-response.type';

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
