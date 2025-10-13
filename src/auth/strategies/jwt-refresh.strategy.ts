import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    const key = configService.get<string>('JWT_REFRESH_SECRET');
    if (!key) {
      throw new Error('JWT_REFRESH_SECRET 환경 변수가 설정되지 않았습니다.');
    }

    super({
      // 1. 요청의 Body에서 'refreshToken' 필드를 읽어옴
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      // 2. 리프레시 토큰용 시크릿 키 사용
      secretOrKey: key,
      // 3. validate 메서드에 request 객체를 전달하기 위한 설정
      passReqToCallback: true,
    });
  }

  /**
   * 4. 토큰이 유효한지 확인되면 validate 메서드가 실행됨
   * @param req : Express의 Request 객체
   * @param payload : 토큰을 디코딩한 내용 (예: { sub: '유저ID' })
   */
  validate(req: Request, payload: any) {
    const refreshToken = req.body.refreshToken;
    // 컨트롤러에서 유저 ID와 리프레시 토큰을 모두 사용하기 위해 객체로 반환
    return { sub: payload.sub, refreshToken };
  }
}