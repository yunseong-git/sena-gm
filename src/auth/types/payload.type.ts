import { Types } from "mongoose";

/**토큰 발급시 사용하는 payload, client에 넘길때도 그대로 사용 */
export interface JwtPayload {
    sub: string; // userId
    userRole: string[]; // ['user'] or ['admin']
    guildId: string | null;
    guildRole: string | null;
}

/**서버에서 사용할 payload 객체, strategy에서 validate로 변환 */
export type UserPayload = {
    id: Types.ObjectId;
    userRole: string[]; // ['user'] or ['admin']
    guildId: Types.ObjectId | null;
    guildRole: string | null;
}