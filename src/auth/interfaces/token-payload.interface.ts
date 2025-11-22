import { GUILD_ROLE_ENUM } from "#src/guild/schemas/guild.schema.js";
import { User_Role_Enum } from "#src/user/user.schema.js";
import { Types } from "mongoose";

// --- 1. Base Token Types (기본 블록) ---

export interface AccessToken {
    accessToken: string;
}

export interface RefreshToken {
    refreshToken: string;
}

// --- 2. Payloads (데이터 명세) ---

/**토큰 발급/Client 전달용 Payload (외부 통신용이므로 ID가 string) */
export interface JwtPayload {
    sub: string; // userId
    userRole: User_Role_Enum;
    guildId: string | null;
    guildRole: string | null;
}

/** 서버 내부 로직용 Payload (Strategy -> Controller) (DB 조작용이므로 ID가 ObjectId) */
export interface UserPayload {
    id: Types.ObjectId;
    userRole: User_Role_Enum;
    guildId: Types.ObjectId | null;
    guildRole: GUILD_ROLE_ENUM | null;
}

// --- 3. Combined Responses (조합형) ---

/**  AccessToken + Payload  */
export interface AccessTokenWithPayload extends AccessToken {
    payload: JwtPayload;
}

/** AccessToken + Payload + RefreshToken */
export interface TokensWithPayload extends AccessTokenWithPayload, RefreshToken { }