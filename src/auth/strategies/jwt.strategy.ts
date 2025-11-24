import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import type { Request } from 'express';
import { JwtPayload, UserPayload } from '../interfaces/token-payload.interface';
import { GUILD_ROLE_ENUM } from '../../guild/schemas/guild.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      // 1. 쿠키에서 accessToken 추출
      jwtFromRequest: (req: Request) => {
        // req.cookies가 없는 경우(미들웨어 미설정 등) 대비
        if (!req || !req.cookies) return null;
        return req.cookies['accessToken'];
      },
      // 2. 만료된 토큰은 401 에러 (false로 설정 시)
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /** * 3. Payload 검증 및 변환
   * (Passport가 서명 검증 완료 후 호출함)
   */
  async validate(payload: JwtPayload): Promise<UserPayload> {
    return {
      id: new Types.ObjectId(payload.sub),
      userRole: payload.userRole,
      guildId: payload.guildId ? new Types.ObjectId(payload.guildId) : null,
      guildRole: payload.guildRole as GUILD_ROLE_ENUM | null,
    };
  }
}