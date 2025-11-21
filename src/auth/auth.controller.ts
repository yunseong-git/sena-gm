import { Controller, Get, Post, Body, Patch, Delete, HttpCode, HttpStatus, UseGuards, Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { AuthGuard } from '@nestjs/passport';
import { RefreshingDto } from './dto/req/refreshing.dto.js';
import { Response } from 'express';
import { Public } from '#src/common/decorators/public.decorators.js';
import { ACCESS_COOKIE_OPTION, REFRESH_COOKIE_OPTION, REGISTER_COOKIE_OPTION } from '#src/common/constatnts/cookie.constant.js';
import type { Request } from 'express';
import { ApiBody, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/res/auth-res.dto.js';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto, UserPayloadDto } from './dto/res/payload.dto.js';
import { RegisterDto } from './dto/req/register.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) { }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인 시도', description: '구글 로그인 페이지로 리다이렉트됩니다.' })
  async googleAuth(@Req() req: Request) { }

  /**구글 인증 후 콜백*/
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint() // Swagger에서 숨길거임.
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response)
    : Promise<void> {
    // req.user에 GoogleStrategy의 validate 반환값이 들어있음
    const result = await this.authService.handleGoogleLogin(req.user);
    const frontendUrl = this.configService.getOrThrow<string>('CLIENT_URL');


    if (result.type === 'login') { // 로그인 성공 -> accessToken,refreshToken 쿠키 굽고 홈으로 리다이렉트
      res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTION);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTION);

      res.redirect(frontendUrl); //프론트엔드에서 auth/profile 호출 필요

    } else {// 회원가입 필요 -> registerToken 쿠키 굽고 회원가입 페이지로 리다이렉트
      res.cookie('registerToken', result.registerToken, REGISTER_COOKIE_OPTION);

      res.redirect(`${frontendUrl}/register`);
    }
  }

  @Public()
  @Post('google/register')
  @ApiOperation({ summary: '구글 회원가입 완료', description: '닉네임을 설정하고 회원가입을 완료합니다. (registerToken 쿠키 필요)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, type: AuthResponseDto, description: '회원가입 성공 및 토큰 발급' })
  async googleRegister(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response,)
    : Promise<AuthResponseDto> {
    // 쿠키에서 토큰 추출
    const registerToken = req.cookies['registerToken'];

    if (!registerToken) {
      throw new UnauthorizedException('가입 시간이 만료되었습니다.');
    }

    const { accessToken, refreshToken, payload } = await this.authService.finalizeGoogleRegister(dto.nickname, registerToken);

    // 로그인 토큰 발급
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTION);

    // 사용한 임시 가입 토큰은 삭제
    res.clearCookie('registerToken', REGISTER_COOKIE_OPTION);

    return { payload };
  }

  @Patch('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 재발급', description: 'RefreshToken을 사용하여 AccessToken을 갱신합니다.' })
  @ApiResponse({ status: 200, type: AuthResponseDto, description: '토큰 갱신 성공' })
  async refreshTokens(@User() dto: RefreshingDto, @Res({ passthrough: true }) res: Response)
    : Promise<AuthResponseDto> {

    const { accessToken, payload } = await this.authService.Refreshing(dto.sub, dto.refreshToken)

    // accessToken 쿠키 설정
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);

    // 페이로드 반환
    return { payload };
  }

  @Get('profile')
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({ status: 200, type: AuthResponseDto, description: '로그인된 유저 정보 반환' })
  async getProfile(@User() user: UserPayloadDto)
    : Promise<AuthResponseDto> {

    //매핑 로직 (ObjectId -> string)
    const jwtPayload: JwtPayloadDto = {
      sub: user.id.toString(),
      userRole: user.userRole,
      guildId: user.guildId?.toString() || null,
      guildRole: user.guildRole || null,
    };

    return { payload: jwtPayload };
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃', description: '쿠키를 삭제하여 로그아웃 처리합니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@Res({ passthrough: true }) res: Response)
    : Promise<void> {
    res.clearCookie('accessToken', ACCESS_COOKIE_OPTION);
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTION);
  }
}