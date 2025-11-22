import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '#src/redis/redis.service.js';
import { UserPayload } from '#src/auth/interfaces/token-payload.interface.js';
import { GUILD_ROLES_KEY } from '../decorators/guild-roles.decorator.js';
import { GUILD_ROLE_ENUM } from '#src/guild/schemas/guild.schema.js';

@Injectable()
export class GuildStrictGuard implements CanActivate {
    constructor(
        private readonly redisService: RedisService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as UserPayload;

        if (!user) throw new UnauthorizedException('로그인 정보가 없습니다.');

        // 1. [Strict] Redis 상태 변경 확인 (Redis 죽으면 503 에러 발생 -> 차단)
        const stateKey = `user:state-patch:${user.id}`;
        const isStateChanged = await this.redisService.getOrThrow(stateKey);

        if (isStateChanged) {
            throw new UnauthorizedException('회원 정보가 변경되어 다시 로그인이 필요합니다.');
        }

        // 2. 길드 멤버십 확인
        if (!user.guildId || !user.guildRole) {
            throw new ForbiddenException('길드에 소속되어 있지 않습니다.');
        }

        // 3. 역할(Role) 권한 확인
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