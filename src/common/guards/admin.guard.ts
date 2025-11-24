import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/user-roles.decorator';
import { UserPayload } from '../../auth/interfaces/token-payload.interface';
import { User_Role_Enum } from '../../user/schemas/user.schema';

/**UserRole 데코레이터의 역할값과 비교하여 관리자를 "인가"하는가드 */
@Injectable()
export class AdminGuard implements CanActivate {
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

    // 유저 정보가 없으면 차단(최종방어)
    if (!user) {
      throw new UnauthorizedException('로그인 정보가 없습니다.');
    }

    // 역할 검사 (Enum 비교) user.userRole이 requiredRoles 배열에 포함되어 있는지 확인
    const hasRole = requiredRoles.some((role) => user.userRole === role);

    if (!hasRole) {
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }

    return true;
  }
}
