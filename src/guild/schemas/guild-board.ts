import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Query, Types } from 'mongoose';

// 길드 역할 Enum
export enum TARGET_TYPE_ENUM {
  MASTER = 'master',
  SUBMASTER = 'submaster',
  MANAGER = 'manager',
  MEMBER = 'member',
}

/*
a의 길드 활동
작성문서개수 : 
승인개수 :
*/


@Schema({ timestamps: true, collection: 'GuildBoards' })
export class GuildBoard {
  //어떤 길드의
  @Prop({ type: Types.ObjectId, required: true, ref: 'Guild' })
  guildId: Types.ObjectId;

  //누가
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  //어디서
  @Prop({ required: true, type: String })
  targetType: string;

  //어떤걸
  @Prop({ required: true, type: Number })
  targetId: Types.ObjectId;

  //어떻게 했는지
  @Prop({ type: String })
  action: string;




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

export type GuildBoardDocument = HydratedDocument<GuildBoard>;
export const GuildBoardSchema = SchemaFactory.createForClass(GuildBoard);


///////////////////////pre-hooks//////////////////////////
// this는 Mongoose의 Query 객체
// '$ne: true'는 isDeleted 필드가 없거나(null, undefined) false인 경우를 모두 포함
// 1. 조회(find) 쿼리를 위한 pre-hook
GuildBoardSchema.pre(
  /^find/,
  function (this: Query<GuildBoardDocument, GuildBoardDocument>, next) {
    this.where({ isDeleted: { $ne: true } });
    next();
  },
);

GuildBoardSchema.index({ name: 1, tag: 1 }, { unique: true });

// 2. 업데이트(update) 쿼리를 위한 pre-hook
/*
GuildBoardSchema.pre(
  ['updateOne', 'updateMany', 'findOneAndUpdate'],
  function (this: Query<GuildBoardDocument, GuildBoardDocument>, next) {
    this.where({ isDeleted: { $ne: true } });

    next();
  });

*/
//길드명 + tag 넘버 복합 인덱스

