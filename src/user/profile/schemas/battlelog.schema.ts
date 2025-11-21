import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserGuildInfo, UserGuildInfoSchema } from './user-guild.schema.js';

@Schema({ _id: false })
class DeckInfo {
  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Hero', required: true }])
  heroes: Hero[]; // 영웅 3명 (ObjectId 배열)

  @Prop({ type: [String], default: [] })
  skill_reservation: string[]; // 스킬 예약 (예: ["플라튼2", "콜트1"])
}

@Schema({ timestamps: { createdAt: 'created_at' } })
export class CombatLog extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user_id: User; // 작성자

  // 방어덱 정보
  @Prop({ type: DeckInfo })
  defense_deck: DeckInfo & {
    @Prop({ type: String, enum: ['전반', '후반'], required: true })
  position: string;
};

// 공격덱 정보
@Prop({ type: DeckInfo })
attack_deck: DeckInfo;

@Prop({ type: String, enum: ['선속공', '후속공'], required: true })
speed: string; // 선속공 | 후속공

@Prop({ type: String, enum: ['승리', '패배'], required: true })
result: string; // 전투 결과

@Prop({
  type: String,
  enum: ['쉬움', '억까당함', '아슬아슬', '운빨로이김', '어림없음'],
  required: true,
})
evaluation: string; // 전투 평가

@Prop({ type: Number, required: true })
evaluation_score: number; // 평가 점수 (10, 8, 6, 4, 1)

@Prop({ type: String, maxlength: 500 })
comment ?: string; // 코멘트 (선택)

@Prop({ type: Boolean, default: false })
is_hidden: boolean; // 비추천 비율이 높아 숨김 처리 여부

@Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
upvotes: User[]; // 추천

@Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
downvotes: User[]; // 비추천
}

export const CombatLogSchema = SchemaFactory.createForClass(CombatLog);

// --- Mongoose Hook (Pre-save) ---
// evaluation 값에 따라 evaluation_score를 자동으로 설정하는 Hook
CombatLogSchema.pre<CombatLog>('validate', function (next) {
  const evaluationMap = {
    '쉬움': 10,
    '억까당함': 8,
    '아슬아슬': 6,
    '운빨로이김': 4,
    '어림없음': 1,
  };

  if (this.evaluation) {
    this.evaluation_score = evaluationMap[this.evaluation] || 0;
  }
  next();
});