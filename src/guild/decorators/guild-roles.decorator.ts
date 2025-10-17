import { SetMetadata } from '@nestjs/common';
import { GuildRole } from '../schemas/guild.schema.js';

// 데코레이터에서 사용할 메타데이터의 '키'를 상수로 정의 (오타 방지)
export const GUILD_ROLES_KEY = 'guild_roles';

// ...roles: GuildRole[] 형태로 여러 개의 역할을 받을 수 있도록 함
export const GuildRoles = (...roles: GuildRole[]) => SetMetadata(GUILD_ROLES_KEY, roles);