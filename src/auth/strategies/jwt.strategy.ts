import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '#src/user/schemas/user.schema.js';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, UserPayload } from '../types/payload.type.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {
    const key = configService.get<string>('JWT_SECRET');
    if (!key) throw new Error('JWT_SECRET is not defined')
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: key, // ConfigService를 통해 비밀 키 가져오기
      ignoreExpiration: false,
    });
  }

  /**
     * JwtPayload(원본)를 받아 UserPayload(가공 후)를 반환
     */
  async validate(payload: JwtPayload): Promise<UserPayload> {

    return {
      // payload.sub (string)를 'id' (ObjectId)로 변환
      id: new Types.ObjectId(payload.sub),
      nickname: payload.nickname,
      tag: payload.tag,
      userRole: payload.userRole,
      // payload.guildId (string | null)를 (ObjectId | null)로 변환
      guildId: payload.guildId ? new Types.ObjectId(payload.guildId) : null,
      guildRole: payload.guildRole,
    };
  }
}

