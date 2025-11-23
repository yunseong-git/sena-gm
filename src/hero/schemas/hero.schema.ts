import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum SKILL_TYPE_ENUM {
  SKILL_1 = 1,
  SKILL_2 = 2,
  NORMAL_ATTACK = 3,
  PASSIVE = 4,
}

export enum RANK_TYPE_ENUM {
  UR = 'UR',
  SSR = 'SSR',
  SR = 'SR',
  R = 'R'
}
export enum HERO_TYPE_ENUM {
  DEFENSE = 'DEFENSE',
  ATTACK = 'ATTACK',
  SUPPORT = 'SUPPORT',
  MAGIC = 'MAGIC',
  ALLROUND = 'ALLROUND'
}


@Schema({ _id: false }) // 스킬 객체 자체는 ID가 필요 없음
export class Skill {
  @Prop({ required: true, enum: SKILL_TYPE_ENUM })
  skillIndex: SKILL_TYPE_ENUM;

  @Prop({ required: true })
  description: string;
}

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Hero {
  @Prop({ required: true, unique: true })
  name: string; // 영웅 이름 (예: 루디)

  @Prop({ required: true, index: true })
  rank: string; // 등급 (예: 전설)

  @Prop({ required: true, index: true })
  type: string; // 유형 (예: HERO_TYPE_ENUM.DEFENSE, HERO_TYPE_ENUM.ATTACK)

  //스킬 배열: 문자열이 아닌 Skill 객체의 배열
  @Prop({ type: [Skill] })
  skills: Skill[];
}

export type HeroDocument = HydratedDocument<Hero>;
export const HeroSchema = SchemaFactory.createForClass(Hero);