import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

//<SubDocument> 길드원 관리로그
@Schema({ timestamps: true })
export class ManageLog {
  @Prop({ type: Types.ObjectId, ref: 'TestUsers' })
  manager_Id: string; //운영진 이름(이건 마스터만 확인가능)

  @Prop({ type: Types.ObjectId, ref: 'TestUsers' })
  target_Id: string; //대상 유저 이름

  @Prop({ type: String, enum: ['good', 'bad'] })
  status: string; //관리 내용(칭찬, 안좋음)

  @Prop({ required: true, type: Types.ObjectId, ref: 'TestUsers' })
  memo: string; //메모
}
export const ManageLogSchema = SchemaFactory.createForClass(ManageLog);

@Schema({ timestamps: true, collection: 'Guilds' })
export class Guild {
  @Prop({ required: true, type: String, unique: true })
  name: string; //길드 이름

  @Prop({ type: String, unique: true })
  code: string; //길드 초대 코드, 최초에는 없어도 되지만, 생긴다음부터는 unique

  @Prop({ required: true, type: Types.ObjectId, ref: 'TestUsers' })
  master: Types.ObjectId; //길드마스터

  @Prop({ required: true, type: [Types.ObjectId], ref: 'TestUsers' })
  managers: Types.ObjectId[]; //운영진들(마스터도 포함)

  @Prop({ required: true, type: [Types.ObjectId], ref: 'TestUsers' })
  members: Types.ObjectId[]; //길드원들(마스터, 운영진도 포함)

  @Prop({ type: [ManageLogSchema] })
  ManageLogs: ManageLog[]; //관리 내용, 마스터는 전체 열람 가능, 운영진은 mangerId 조회 불가능
}

export type GuildDocument = HydratedDocument<Guild>;
export const GuildSchema = SchemaFactory.createForClass(Guild);
