import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

// Enum definitions remain the same
export enum CastleType {
  outer_1 = 'outer_1',
  outer_2 = 'outer_2',
  outer_3 = 'outer_3',
  outer_4 = 'outer_4',
  outer_5 = 'outer_5',
  inner_1 = 'inner_1',
  inner_2 = 'inner_2',
  inner_3 = 'inner_3',
  main = 'main',
}

// <SubSubDocument> Defense_Team (방어팀) 정보
@Schema()
export class Defense_Team {
  @Prop({
    required: true,
    type: Types.ObjectId,
    default: () => new Types.ObjectId(),
  })
  team_Id: Types.ObjectId; // BattleLog에서 참조할 고유 ID

  @Prop({ required: true })
  enemy_Name: string; // 방어팀 유저 이름

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Deck' })
  deck: Types.ObjectId; // deck 컬렉션 참조
}

// <SubDocument> Castle (방어벽) 정보
@Schema()
export class Castle {
  @Prop({ required: true, type: String, enum: CastleType })
  type: string; // 성의 종류

  @Prop({ required: true, type: Number })
  totalTeams: number; // 성에 배치된 총 방어팀 수

  @Prop({ required: true, type: Number })
  remainingTeams: number; // 남은 방어팀 수

  @Prop({ type: [Defense_Team] })
  Defense_Teams: Defense_Team[];
}

// 최종 Session 스키마
@Schema({ timestamps: true, collection: 'Sessions' })
export class Session {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Guilds' })
  guildId: Types.ObjectId;

  @Prop({ required: true })
  round: string;

  @Prop({ required: true })
  enemyGuildName: string;

  @Prop({ type: [Castle] })
  castles: Castle[];

  @Prop({ required: true, type: Boolean, default: true })
  isActive: boolean;
}

export type SessionDocument = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);

// 유니크 복합인덱스(길드당 라운드는 한개씩만)
SessionSchema.index({ guildId: 1, round: 1 }, { unique: true });
