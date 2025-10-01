import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { TestUser, TestUserDocument } from 'src/user/schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(TestUser.name)
    private userModel: Model<TestUserDocument>,
    private configService: ConfigService,
  ) {
    const key = configService.get<string>('JWT_SECRET_KEY');
    if (!key) throw new Error('JWT_SECRET_KEY is not defined')
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: key, // ConfigService를 통해 비밀 키 가져오기
      ignoreExpiration: false,
    });
  }

  // 4. JWT가 유효성 검사를 통과하면 호출되는 메서드입니다.
  // 페이로드를 기반으로 사용자를 찾아 반환합니다.
  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    // 요청 객체(req.user)에 사용자 정보를 담아 라우트 핸들러로 전달합니다.
    return user;
  }
}

