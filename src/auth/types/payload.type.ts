import { Types } from "mongoose";

export interface JwtPayload {
    sub: string; // userId
    nickname: string;
    tag: number;
    userRole: string[]; // ['user'] or ['admin']
    guildId: string | null;
    guildRole: string | null;
}

export type UserPayload = {
    id: Types.ObjectId;
    nickname: string;
    tag: number;
    userRole: string[]; // ['user'] or ['admin']
    guildId: Types.ObjectId | null;
    guildRole: string | null;
}