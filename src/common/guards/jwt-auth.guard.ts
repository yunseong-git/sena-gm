import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorators.js';

/**전역으로 로그인 유저를 "인증"하는 가드, 우회 시 public 데코레이터 사용 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // @Public() 데코레이터가 있는지 확인 (핸들러 또는 클래스 레벨)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // @Public()이 있으면? -> 부모(AuthGuard)의 검사를 건너뛰고 true 반환
    if (isPublic) {
      return true;
    }

    // 없으면? -> 부모(AuthGuard)의 검사 실행 (토큰 검증)
    return super.canActivate(context);
  }
}