import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GUILD_ROLES_KEY } from '../decorators/guild-roles.decorator';
import { GuildRole } from '../schemas/guild.schema';

@Injectable()
export class GuildGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // 1. @GuildRoles() 데코레이터에 전달된 인자(필요한 역할)를 가져온다.
    const requiredRoles = this.reflector.getAllAndOverride<GuildRole[]>(GUILD_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. 데코레이터가 없으면, 이 가드는 통과시킨다. (길드 역할이 필요 없는 API)
    if (!requiredRoles) {
      return true;
    }

    // 3. AuthGuard 등을 통해 req 객체에 담긴 user 정보를 가져온다.
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      // 혹시 모를 상황 대비: AuthGuard가 제대로 작동 안했거나, user 정보가 없을 경우
      throw new UnauthorizedException('로그인 정보가 없습니다.');
    }

    // 4. 유저가 길드에 소속되어 있는지, 역할 정보가 있는지 확인
    if (!user.guild_Id || !user.guild_role) {
      throw new ForbiddenException('길드에 소속되어 있지 않거나, 길드 역할이 없습니다.');
    }

    // 5. 이 API에 필요한 역할 중 하나라도 유저의 역할과 일치하는지 확인
    // @GuildRoles() 처럼 인자 없이 데코레이터만 사용하면, 길드 소속 여부만 체크하게 됨
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.guild_role)) {
      throw new ForbiddenException('이 작업을 수행할 권한이 없습니다.');
    }

    // 6. 모든 검증을 통과하면 접근 허용
    return true;
  }
}