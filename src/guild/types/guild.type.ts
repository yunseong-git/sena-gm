import { Types } from "mongoose";
import { GuildRole } from "../schemas/guild.schema";

export type simpleGuildInfo = {
  _id: Types.ObjectId;
  name: string;
  tag: number;
}

export type guildMember = {
  user_Id: Types.ObjectId;
  role: GuildRole;
}