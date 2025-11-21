import { Types } from "mongoose";
import { GUILD_ROLE_ENUM } from "../schemas/guild.schema.js";

//길드원 기본 정보 (이름, 태그, 역할)
export type GuildMemberBasicInfo = {
  _id: Types.ObjectId; // User ID
  nickname: string;
  tag: number;
  role: GUILD_ROLE_ENUM | string;
}

//길드원 상세 정보 (이름, 태그, 영웅 목록)
export type GuildMemberDetailInfo = {
  _id: Types.ObjectId; // User ID
  nickname: string;
  tag: number;
}