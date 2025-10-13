// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { TestUser, TestUserDocument } from 'src/user/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { RedisService } from 'src/redis/redis.service';
import { AccessToken, Tokens } from './types/token-response.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(TestUser.name) private userModel: Model<TestUserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) { }
  ////only-test////
  async register(registerDto: RegisterDto) {
    // 비밀번호 해싱 없이 그대로 저장
    const createdUser = new this.userModel(registerDto);
    return createdUser.save();
  }

  /**
   * 1. 유저 확인(validateUser)
   * 2. blacklist 해제
   * 3. 토큰활성화 / access는 생성만, refresh는 생성후 유저 collection에 저장
   * 4. accesstoken 및 refreshToken return */
  async login(loginDto: LoginDto): Promise<Tokens> {
    const { nickname, password } = loginDto;

    // 비밀번호 해싱 비교 없이 평문으로 비교(나중에 oauth 도입시 삭제 예정)
    const user = await this.validateUser(nickname, password);
    if (!user) throw new UnauthorizedException('닉네임 또는 비밀번호가 올바르지 않습니다.');

    //blacklist 제외
    await this.redisService.removeFromBlacklist(user._id);

    //accessToken 발급
    const accessToken = await this.generateAccessToken(user)

    //refreshToken 발급 및 저장
    const refreshToken = await this.activateRefreshToken(user)

    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }

  /**access token 발급 */
  private async generateAccessToken(user: TestUserDocument): Promise<string> {
    const payload = {
      sub: user._id,
      nickname: user.nickname,
      guild: user.guild || null // 길드가 없으면 null
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    return accessToken;
  }

  /**refresh token 발급 및 저장 */
  private async activateRefreshToken(user: TestUserDocument): Promise<string> {
    const payload = {
      sub: user._id
    }
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    await this.userService.saveRefreshToken(user._id.toString(), refreshToken)

    return refreshToken;
  }

  /**유저 검증 */
  async validateUser(nickname: string, password: string): Promise<TestUserDocument> {
    const user = await this.userModel.findOne({ nickname, password });
    if (!user) {
      throw new UnauthorizedException('닉네임 또는 비밀번호가 올바르지 않습니다.');
    }
    return user;
  }

  /**refreshToken 검증 후 access_token 재발급 */
  async Refreshing(user_Id: string, refreshToken: string): Promise<AccessToken> {
    const user = await this.userService.getUserIfRefreshTokenMatches(user_Id, refreshToken);
    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const newAccessToken = await this.generateAccessToken(user);
    return { accessToken: newAccessToken };
  }

  async logout(user_Id: string): Promise<void> {
    // 액세스 토큰의 만료 시간과 동일하게 설정하여, 해당 토큰의 남은 수명 동안만 차단
    const ttl = 900; // 15분
    await this.redisService.blacklistUser(user_Id, ttl);
  }

  async issueTokens(user: TestUserDocument) {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.activateRefreshToken(user); // 이 메서드는 내부적으로 DB 저장까지 포함

    return { accessToken, refreshToken };
  }
}