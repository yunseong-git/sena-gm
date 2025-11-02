import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserHero } from './user-heroes.schema.js';

// '반지(Rings)'를 위한 최적의 구조: Object Map (Dictionary)
// { "ring_6s_immortal": 1, "ring_6s_immortal_opt_revive_6s": 0, "ring_6s_immortal_opt_power_5s": 3 }
// 키(key)는 고정된 반지ID, 값(value)은 보유 개수(count)

@Schema({ _id: false, strict: false }) // strict: false로 해야 동적 키 추가 가능
class RingInventory {
  [key: string]: number;
}

@Schema({ collection: 'userpowers' })
export class UserPower {
  // 1. User 컬렉션과 1:1 매칭 (필수)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // 2. 기존 'UserHero' 스키마 배열을 그대로 사용 (참조 방식)
  @Prop({ type: [UserHero], default: [] })
  heroes: UserHero[];

  // 3. 링 인벤토리 (Object Map)
  @Prop({ type: RingInventory, default: {} })
  rings: RingInventory;
}

export type UserPowerDocument = HydratedDocument<UserPower>;
export const UserPowerSchema = SchemaFactory.createForClass(UserPower);