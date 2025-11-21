import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Query, Types } from 'mongoose';

// 길드 역할 Enum
export enum GUILD_ROLE_ENUM {
  MASTER = 'master',
  SUBMASTER = 'submaster',
  MANAGER = 'manager',
  MEMBER = 'member',
}

@Schema({ timestamps: true, collection: 'Guilds' })
export class Guild {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: Number })
  tag: number;

  @Prop({ type: String })
  notice: string;

  @Prop({ type: Types.ObjectId, required: true })
  master: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  submaster: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [] })
  managers: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  members: Types.ObjectId[];

  //길드 초대 코드(unique+sparse: 필드가 선택적이지만 존재한다면 유니크)
  @Prop({ type: String, unique: true, sparse: true, select: false })
  code?: string;

  @Prop({ required: true, type: Boolean, default: false })
  isDeleted: boolean;
}

export type GuildDocument = HydratedDocument<Guild>;
export const GuildSchema = SchemaFactory.createForClass(Guild);

// --- indexes ---

//길드명 + tag 넘버 복합 인덱스
GuildSchema.index({ name: 1, tag: 1 }, { unique: true });

