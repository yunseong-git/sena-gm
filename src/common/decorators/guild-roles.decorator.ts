import { SetMetadata } from '@nestjs/common';
import { GUILD_ROLE_ENUM } from '../../guild/schemas/guild.schema';

// 데코레이터에서 사용할 메타데이터의 '키'를 상수로 정의 (오타 방지)
export const GUILD_ROLES_KEY = 'guild_roles';

// ...roles: GUILD_ROLE_ENUM[] 형태로 여러 개의 역할을 받을 수 있도록 함
export const Guild_Roles = (...roles: GUILD_ROLE_ENUM[]) => SetMetadata(GUILD_ROLES_KEY, roles);