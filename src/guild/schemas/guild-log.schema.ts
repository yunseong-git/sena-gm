import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Query, Types } from 'mongoose';

// 길드 역할 Enum
export enum TARGET_TYPE_ENUM {
  MASTER = 'master',
  SUBMASTER = 'submaster',
  MANAGER = 'manager',
  MEMBER = 'member',
}

//a가 가입했습니다. 환영합니다
//b가 탈퇴했습니다(추방도 동일)
//c의 권한이 변경되었습니다.
//d가 신규 heroset을 작성했습니다
//e가 신규 deckset을 작성했습니다.

@Schema({ timestamps: true, collection: 'GuildLogs' })
export class GuildLog {
  //어떤 길드의
  @Prop({ type: Types.ObjectId, required: true, ref: 'Guild' })
  guildId: Types.ObjectId;

  //누가
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  actorId: Types.ObjectId;

  //어디서
  @Prop({ required: true, type: String })
  targetType: string;

  //어떻게 했는지
  @Prop({ type: String })
  action: string;

  @Prop({ required: true, type: Boolean, default: false })
  isDeleted: boolean;
}

export type GuildLogDocument = HydratedDocument<GuildLog>;
export const GuildLogSchema = SchemaFactory.createForClass(GuildLog);


///////////////////////pre-hooks//////////////////////////
// this는 Mongoose의 Query 객체
// '$ne: true'는 isDeleted 필드가 없거나(null, undefined) false인 경우를 모두 포함
// 1. 조회(find) 쿼리를 위한 pre-hook
GuildLogSchema.pre(
  /^find/,
  function (this: Query<GuildLogDocument, GuildLogDocument>, next) {
    this.where({ isDeleted: { $ne: true } });
    next();
  },
);

GuildLogSchema.index({ name: 1, tag: 1 }, { unique: true });

// 2. 업데이트(update) 쿼리를 위한 pre-hook
/*
GuildLogSchema.pre(
  ['updateOne', 'updateMany', 'findOneAndUpdate'],
  function (this: Query<GuildLogDocument, GuildLogDocument>, next) {
    this.where({ isDeleted: { $ne: true } });

    next();
  });

*/
//길드명 + tag 넘버 복합 인덱스

