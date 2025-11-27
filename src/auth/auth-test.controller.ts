import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
// Services
import { AuthService } from './auth.service';
// DTOs
import { CreateTestUserDto, LoginTestUserDto } from '../user/test-auth.dto';
import { AuthResponseDto } from './dto/res/auth-res.dto';
// Others
import { Public } from '../common/decorators/public.decorators';
import { ACCESS_COOKIE_OPTION, REFRESH_COOKIE_OPTION } from '../common/constatnts/cookie.constant';
import { UserTestService } from '../user/services/user-test.service';

@ApiTags('Auth (Test)')
@Controller('auth/test')
export class AuthTestController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserTestService,
  ) { }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '[Test] 간편 회원가입', description: '비밀번호로 가입하고 바로 로그인 처리합니다. (배포 시 삭제 요망)' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async createTestUser(
    @Body() dto: CreateTestUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    // 1. 유저 생성 (UserService 위임)
    const newUser = await this.userService.createTestUser(dto);

    // 2. 토큰 발급 (AuthService)
    const { accessToken, refreshToken, payload } = await this.authService.activateTokenSet(newUser);

    // 3. 쿠키 굽기
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTION);

    return { payload };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '[Test] 간편 로그인', description: '닉네임/비번으로 로그인합니다.' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async loginTestUser(
    @Body() dto: LoginTestUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    // 1. 유저 검증 (UserService 위임)
    const user = await this.userService.validateTestUser(dto);

    // 2. 토큰 발급
    const { accessToken, refreshToken, payload } = await this.authService.activateTokenSet(user);

    // 3. 쿠키 굽기
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTION);

    return { payload };
  }
}