// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '#src/user/profile/schemas/user.schema.js';
import { LoginDto } from './dto/login.dto.js';
import { ConfigService } from '@nestjs/config';
import { UserService } from '#src/user/profile/user.service.js';
import { RedisService } from '#src/redis/redis.service.js';
import { AccessTokenWithPayload, TokensWithPayload } from './types/token-response.type.js';
import { CreateUserDto } from '#src/user/profile/dto/user.dto.js';
import { UserPayload } from './types/payload.type.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) { }

  async register(dto: CreateUserDto): Promise<UserDocument> {
    const createdUser = await this.userService.createUser(dto);
    return createdUser;
  }

  /**
   * 1. 유저 확인(validateUser)
   * 2. blacklist 해제
   * 3. 토큰활성화 / access는 생성만, refresh는 생성후 유저 collection에 저장
   * 4. accesstoken 및 refreshToken return */
  async login(dto: LoginDto): Promise<TokensWithPayload> {
    const { testId, password } = dto;

    // 비밀번호 해싱 비교 없이 평문으로 비교(나중에 oauth 도입시 삭제 예정)
    const user = await this.validateUser(testId, password);

    await this.redisService.removeFromBlacklist(user._id.toString());
    const { accessToken, payload } = await this.generateAccessToken(user)
    const refreshToken = await this.activateRefreshToken(user)

    return { accessToken, refreshToken, payload };
  }

  /**access token 발급 */
  private async generateAccessToken(user: UserDocument): Promise<AccessTokenWithPayload> {
    const payload = {
      sub: user.id.toString(),
      userRole: user.roles,
      guildId: user.guild?.guildId.toString() || null,
      guildRole: user.guild?.role || null
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    return { accessToken, payload };
  }

  /**refresh token 발급 및 저장 */
  private async activateRefreshToken(user: UserDocument): Promise<string> {
    const payload = {
      sub: user._id.toString()
    }
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    await this.userService.saveRefreshToken(user._id, refreshToken)

    return refreshToken;
  }

  /**유저 검증 */
  async validateUser(testId: string, password: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ testId, password });
    if (!user) {
      throw new UnauthorizedException('닉네임 또는 비밀번호가 올바르지 않습니다.');
    }
    return user;
  }

  /**refreshToken 검증 후 access_token 재발급(클라이언트 주도용) */
  async Refreshing(userId: string, refreshToken: string): Promise<AccessTokenWithPayload> {
    const user = await this.userService.getUserIfRefreshTokenMatches(userId, refreshToken);
    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const { accessToken, payload } = await this.generateAccessToken(user);
    return { accessToken, payload };
  }

  async logout(userId: Types.ObjectId): Promise<void> {
    // 액세스 토큰의 만료 시간과 동일하게 설정하여, 해당 토큰의 남은 수명 동안만 차단
    await this.userService.removeRefreshToken(userId);
    await this.redisService.setRefreshList(userId);
  }

  /**유저 확인후 토큰 재발급(서버 주도용) */
  async issueTokens(old_user: UserPayload): Promise<TokensWithPayload> {
    const user = await this.userModel.findById(old_user.id);
    if (!user) throw new UnauthorizedException('유저를 찾을 수 없습니다.');

    const { accessToken, payload } = await this.generateAccessToken(user);
    const refreshToken = await this.activateRefreshToken(user); // 이 메서드는 내부적으로 DB 저장까지 포함

    return { accessToken, payload, refreshToken };
  }
}