import { Types } from "mongoose";

export type simpleGuildInfo = {
  _id: Types.ObjectId;
  name: string;
  tag: number;
}

export type guildCode = {
  code: string;
}
