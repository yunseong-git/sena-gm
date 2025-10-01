// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TestUser, TestUserDocument } from 'src/user/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(TestUser.name) private userModel: Model<TestUserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }
  ////only-test////
  async register(registerDto: RegisterDto) {
    // 비밀번호 해싱 없이 그대로 저장
    const createdUser = new this.userModel(registerDto);
    return createdUser.save();
  }

  async login(loginDto: LoginDto) {
    const { nickname, password } = loginDto;

    // 비밀번호 해싱 비교 없이 평문으로 비교(나중에 oauth 도입시 삭제 예정)
    const user = await this.validateUser(nickname, password);

    //payload 설정
    const accessTokenPayload = {
      sub: user._id,
      nickname: user.nickname,
      guild: user.guild || null // 길드가 없으면 null
    };

    const refreshTokenPayload = {
      sub: user._id
    }


    await this.generateAccessToken(user, accessTokenPayload)
    await this.generateRefreshToken(user, refreshTokenPayload)

    return {
      access_token: this.jwtService.sign(refreshTokenPayload),
    };
  }

  /**access token 발급 */
  async generateAccessToken(user: TestUserDocument, payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    return accessToken;
  }

  /**refresh token 발급 및 저장 */
  async generateRefreshToken(user: TestUserDocument, payload: any) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    //유저 서비스의 토큰 저장

    return refreshToken;
  }

  /**유저 refresh token 검증 */
  async validateRefreshToken(refreshToken: string) {

  }



  /**유저 검증 */
  async validateUser(nickname: string, password: string): Promise<TestUserDocument> {
    const user = await this.userModel.findOne({ nickname, password });
    if (!user) {
      throw new UnauthorizedException('닉네임 또는 비밀번호가 올바르지 않습니다.');
    }
    return user;
  }
}