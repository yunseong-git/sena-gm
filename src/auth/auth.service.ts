import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthResult } from './interfaces/google.interface';
import { TokensWithPayload, AccessTokenWithPayload, RefreshToken } from './interfaces/token-payload.interface';
import { RedisService } from '../redis/redis.service';
import { UserDocument } from '../user/schemas/user.schema';
import { UserService } from '../user/services/user.service';
import { JWT_EXPIRATION } from '../common/constatnts/cookie.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) { }

  // --- google auth ---

  /** 구글 로그인 동작 (two case) */
  async handleGoogleLogin(googleUser: { googleId: string; email: string })
    : Promise<GoogleAuthResult> {
    const user = await this.userService.findByGoogleId(googleUser.googleId);

    if (user) { // Case A: 이미 가입된 유저 -> 로그인 토큰 발급
      const tokensWithPayload = await this.activateTokenSet(user);
      await this.redisService.safeDel(user._id.toString());

      return {
        type: 'login',
        ...tokensWithPayload,
      };

    } else { // Case B: 신규 유저 -> 가입용 임시 토큰 발급
      const registerToken = await this.jwtService.signAsync(
        { googleId: googleUser.googleId, email: googleUser.email },
        { secret: this.configService.get('JWT_REGISTER_SECRET'), expiresIn: JWT_EXPIRATION.REGISTER },
      );

      return {
        registerToken,
        type: 'register'
      };
    }
  }

  /** google register */
  async finalizeGoogleRegister(nickname: string, registerToken: string)
    : Promise<TokensWithPayload> {
    //register 토큰 decode
    const decoded = await this.jwtService.verifyAsync(registerToken, {
      secret: this.configService.getOrThrow('JWT_REGISTER_SECRET')
    });

    //create user info
    const userInfo = {
      googleId: decoded.googleId,
      nickname: nickname,
      email: decoded.email,
    }

    //유저 create
    const newUser = await this.userService.createGoogleUser(userInfo)

    //토큰셋 발급
    const TokensWithPayload = await this.activateTokenSet(newUser)

    return TokensWithPayload;
  }

  // --- refreshing ---

  /**refreshToken 검증 후 access_token 재발급(클라이언트 주도용) */
  async Refreshing(userId: string, refreshToken: string)
    : Promise<AccessTokenWithPayload> {
    const user = await this.userService.getUserIfRefreshTokenMatches(userId, refreshToken);
    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const AccessTokenWithPayload = await this.issueAccessToken(user);

    //patchList에서 제거
    await this.redisService.safeDel(user._id.toString());

    return AccessTokenWithPayload;
  }



  // --- about tokens ---

  /**accessToken 발급, refrehToken 발급 및 DB 저장 */
  async activateTokenSet(user: UserDocument)
    : Promise<TokensWithPayload> {
    //token-set 발급
    const { accessToken, payload } = await this.issueAccessToken(user)
    const { refreshToken } = await this._issueRefreshToken(user)

    //refresh-token 저장
    await this.userService.saveRefreshToken(user._id, refreshToken)

    return { accessToken, refreshToken, payload };
  }

  /**access token 발급 */
  async issueAccessToken(user: UserDocument)
    : Promise<AccessTokenWithPayload> {
    console.log('[DEBUG] Token Issue User:', user);
    const payload = {
      sub: user._id.toString(),
      userRole: user.role,
      guildId: user.guildId?.toString() || null,
      guildRole: user.guildRole || null
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: JWT_EXPIRATION.ACCESS,
    });
    return { accessToken, payload };
  }

  /**refresh token 발급 및 저장 */
  private async _issueRefreshToken(user: UserDocument)
    : Promise<RefreshToken> {
    const payload = {
      sub: user._id.toString()
    }
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: JWT_EXPIRATION.REFRESH,
    });

    return { refreshToken };
  }


}