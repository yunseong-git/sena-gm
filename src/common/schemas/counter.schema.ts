import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// 트랜잭션 외부에서 태그 번호표 먼저 뽑기 (Atomicity 보장, Lock 시간 최소화)

@Schema({ collection: 'counters' })
export class Counter {
  @Prop({ required: true, unique: true })
  key: string; // 예: 'guild_tag', 'user_tag'

  @Prop({ required: true, default: 0 })
  seq: number; // 현재 번호
}

export type CounterDocument = HydratedDocument<Counter>;
export const CounterSchema = SchemaFactory.createForClass(Counter);