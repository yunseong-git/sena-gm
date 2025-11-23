import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/user-roles.decorator.js';
import { UserPayload } from '#src/auth/interfaces/token-payload.interface.js';
import { User_Role_Enum } from '#src/user/user.schema.js';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // 필요한 역할 가져오기 (Enum 배열)
    const requiredRoles = this.reflector.getAllAndOverride<User_Role_Enum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 역할 제한이 없으면 통과
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 유저 정보 가져오기
    const user = context.switchToHttp().getRequest() as UserPayload;

    // 방어 코드] 유저 정보가 없으면 (로그인 안 함) 차단
    // (전역 AuthGuard가 있더라도 여기서 한 번 더 막는 게 안전합니다)
    if (!user) {
      throw new UnauthorizedException('로그인 정보가 없습니다.');
    }

    // 역할 검사 (Enum 비교)
    // user.userRole이 requiredRoles 배열에 포함되어 있는지 확인
    const hasRole = requiredRoles.some((role) => user.userRole === role);

    if (!hasRole) {
      throw new ForbiddenException('관리자 권한이 필요합니다.'); // 👈 명확한 에러 메시지
    }

    return true;
  }
}
