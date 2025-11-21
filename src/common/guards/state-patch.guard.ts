import { RedisService } from '#src/redis/redis.service.js';
import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class StatePatchGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // --- fail fast ---
    if (!user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    // --- check Redis ----
    const key = `user:state-patch:${user.id}`;

    // 만약 redis가 터져있으면 갱신이 안될뿐 서비스는 정상 동작함.
    const isStatePatchListed = await this.redisService.safeGet(key);

    if (isStatePatchListed) {
      throw new UnauthorizedException('회원 정보가 변경되어 다시 로그인이 필요합니다.');
    }

    return true;
  }
}