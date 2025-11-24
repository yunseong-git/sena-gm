import { SetMetadata } from '@nestjs/common';
import { User_Role_Enum } from '../../user/schemas/user.schema';

export const ROLES_KEY = 'user_roles';

/**
 * User Role(s) 메타데이터를 설정합니다.
 * @example @UserRoles(User_Role_Enum.ADMIN)
 */
// string[] 대신 Enum 타입 사용
export const UserRoles = (...roles: User_Role_Enum[]) => SetMetadata(ROLES_KEY, roles);