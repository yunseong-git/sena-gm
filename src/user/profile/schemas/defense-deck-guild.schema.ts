import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class DefenseDeckGuild {
  // ... (다른 필드들)

  @Prop({ default: 0 })
  recommendCount: number; // 추천 수

  @Prop({ default: 0 })
  nonRecommendCount: number; // 비추천 수

  // ❌ 삭제 (더 이상 필요 없음)
  // @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  // recommendations: Types.ObjectId[];
}