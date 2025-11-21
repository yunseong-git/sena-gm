import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GUILD_ROLES_KEY } from '../decorators/guild-roles.decorator.js';
import { GUILD_ROLE_ENUM } from '../../guild/schemas/guild.schema.js';

@Injectable()
export class GuildGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    //@Guild_Role() 데코레이터에 전달된 인자(필요한 역할) 가져옴
    const requiredRoles = this.reflector.getAllAndOverride<GUILD_ROLE_ENUM[]>(GUILD_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    //데코레이터가 없으면, 이 가드는 통과 (길드 역할이 필요 없는 API)
    if (!requiredRoles) {
      return true;
    }

    //AuthGuard 등을 통해 req 객체에 담긴 user 정보를 가져옴
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      // 혹시 모를 상황 대비: AuthGuard가 제대로 작동 안했거나, user 정보가 없을 경우
      throw new UnauthorizedException('로그인 정보가 없습니다.');
    }

    //유저가 길드에 소속되어 있는지, 역할 정보가 있는지 확인
    if (!user.guildId || !user.GUILD_ROLE_ENUM) {
      throw new ForbiddenException('길드에 소속되어 있지 않거나, 길드 역할이 없습니다.');
    }

    // 이 API에 필요한 역할 중 하나라도 유저의 역할과 일치하는지 확인
    // @GUILD_ROLE() 처럼 인자 없이 데코레이터만 사용하면, 길드 소속 여부만 체크하게 됨
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.GUILD_ROLE)) {
      throw new ForbiddenException('이 작업을 수행할 권한이 없습니다.');
    }

    //모든 검증을 통과하면 접근 허용
    return true;
  }
}