import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GUILD_ROLES_KEY } from '../decorators/guild-roles.decorator';
import { IS_STRICT_KEY } from '../decorators/strict.decorator';
import { UserPayload } from '../../auth/interfaces/token-payload.interface';
import { GUILD_ROLE_ENUM } from '../../guild/schemas/guild.schema';
import { RedisService } from '../../redis/redis.service';

/**(strict 여부에 따라 분기처리)redis의 state-patch list를 확인하여 refresh를 유도하고, 통과시 GuildRole 데코레이터의 역할값과 비교하여 "인가"하는 가드 */
@Injectable()
export class GuildGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserPayload;

    if (!user) throw new UnauthorizedException('로그인 정보가 없습니다.');

    // Strict 여부 확인
    const isStrict = this.reflector.getAllAndOverride<boolean>(IS_STRICT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Redis 상태 변경 확인 (분기 처리)
    const stateKey = `user:state-patch:${user.id}`;
    let isStateChanged: string | null;

    if (isStrict) {
      // [Strict] Redis 죽으면 에러 (Fail-Closed)
      isStateChanged = await this.redisService.getOrThrow(stateKey);
    } else {
      // [Safe] Redis 죽으면 무시 (Fail-Open)
      isStateChanged = await this.redisService.safeGet(stateKey);
    }

    if (isStateChanged) {
      throw new UnauthorizedException('회원 정보가 변경되어 다시 로그인이 필요합니다.');
    }

    // 길드 멤버십 확인 (공통)
    if (!user.guildId || !user.guildRole) {
      throw new ForbiddenException('길드에 소속되어 있지 않습니다.');
    }

    // 역할(Role) 권한 확인 (공통)
    const requiredRoles = this.reflector.getAllAndOverride<GUILD_ROLE_ENUM[]>(GUILD_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.guildRole)) {
        throw new ForbiddenException('이 작업을 수행할 권한이 없습니다.');
      }
    }

    return true;
  }
}