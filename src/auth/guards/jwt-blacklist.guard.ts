import { REDIS_CLIENT } from '#src/redis/redis.constants.js';
import { Injectable, Inject, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Redis } from 'ioredis';


@Injectable()
export class JwtBlacklistGuard extends PassportAuthGuard('jwt') {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 기본 JWT 인증 수행 (토큰 유효성, 만료일 등)
    const result = (await super.canActivate(context)) as boolean;
    if (!result) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 2. Redis에 해당 유저 ID가 블랙리스트에 있는지 확인
    const isBlacklisted = await this.redis.get(`blacklist:${user._id.toString()}`);

    // 3. 블랙리스트에 있다면, 인증 실패 처리
    if (isBlacklisted) {
      throw new UnauthorizedException('로그인 정보가 유효하지 않습니다.');
    }

    // 모든 검증 통과
    return true;
  }
}

/* <provider in Nest, 의존성 주입(DI) 시스템이 작동하는 방식>

컨트롤러에서 @UseGuards(AuthGuard) 데코레이터를 사용하면
NestJS는 AuthGuard라는 이름(토큰)을 가진 Provider를 찾는다.

이때, AuthModule의 providers 배열에 내가 직접 만든 AuthGuard 클래스를 등록해 둠.
NestJS는 @nestjs/passport에 내장된 범용 가드 대신 우리가 만든 AuthGuard를 사용하게 된다.
(만약 직접 만든 AuthGuard 클래스를 등록하지 않았다면 내장된 범용 가드를 사용함)

컨트롤러 파일 상단에 import { AuthGuard } from '#src/auth/guards/auth.guard'; 라고 명시적으로 파일 import를 잘해야 함.
-> 걍 이름 바꿔서 해결함
*/