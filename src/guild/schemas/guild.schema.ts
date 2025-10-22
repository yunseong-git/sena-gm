import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Query, Types } from 'mongoose';

// 길드 역할 Enum
export enum GuildRole {
  MASTER = 'master',
  SUBMASTER = 'submaster',
  MANAGER = 'manager',
  MEMBER = 'member',
}

//<SubDocument> 길드원 정보
@Schema({ _id: false })
export class GuildMember {
  @Prop({ required: true, type: Types.ObjectId, ref: 'TestUsers' })
  user_Id: Types.ObjectId;

  @Prop({ required: true, type: String, enum: GuildRole, default: GuildRole.MEMBER })
  role: string;
}
export const GuildMemberSchema = SchemaFactory.createForClass(GuildMember);

@Schema({ timestamps: true, collection: 'Guilds' })
export class Guild {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: Number })
  tag: number;

  //길드 초대 코드(unique+sparse: 필드가 선택적이지만 존재한다면 유니크)
  @Prop({ type: String, unique: true, sparse: true, select: false })
  code?: string;

  // GuildMember 서브도큐먼트 배열로 모든 길드원 정보를 통합 관리
  @Prop({ type: [GuildMemberSchema], default: [] })
  members: GuildMember[];

  @Prop({ required: true, type: Boolean, default: false })
  isDeleted: boolean;
}

export type GuildDocument = HydratedDocument<Guild>;
export const GuildSchema = SchemaFactory.createForClass(Guild);


///////////////////////pre-hooks//////////////////////////
// this는 Mongoose의 Query 객체
// '$ne: true'는 isDeleted 필드가 없거나(null, undefined) false인 경우를 모두 포함
// 1. 조회(find) 쿼리를 위한 pre-hook
GuildSchema.pre(
  /^find/,
  function (this: Query<GuildDocument, GuildDocument>, next) {
    this.where({ isDeleted: { $ne: true } });
    next();
  },
);

// 2. 업데이트(update) 쿼리를 위한 pre-hook 
/*
GuildSchema.pre(
  ['updateOne', 'updateMany', 'findOneAndUpdate'],
  function (this: Query<GuildDocument, GuildDocument>, next) {
    this.where({ isDeleted: { $ne: true } });

    next();
  });

*/
//길드명 + tag 넘버 복합 인덱스
GuildSchema.index({ name: 1, tag: 1 }, { unique: true }); 
