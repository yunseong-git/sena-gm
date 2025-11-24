import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum HERO_SKILL_ENUM {
  SKILL_1 = 1,
  SKILL_2 = 2,
  NORMAL_ATTACK = 3,
  PASSIVE = 4,
}

export enum HERO_RANK_ENUM {
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

export const RankOrder: Record<string, number> = {
  [HERO_RANK_ENUM.UR]: 1,
  [HERO_RANK_ENUM.SSR]: 2,
  [HERO_RANK_ENUM.SR]: 3,
  [HERO_RANK_ENUM.R]: 4,
};

export const TypeOrder: Record<string, number> = {
  [HERO_TYPE_ENUM.ATTACK]: 1,
  [HERO_TYPE_ENUM.MAGIC]: 2,
  [HERO_TYPE_ENUM.ALLROUND]: 3,
  [HERO_TYPE_ENUM.SUPPORT]: 4,
  [HERO_TYPE_ENUM.DEFENSE]: 5,
};


@Schema({ _id: false }) // 스킬 객체 자체는 ID가 필요 없음
export class Skill {
  @Prop({ required: true, enum: HERO_SKILL_ENUM })
  skillIndex: HERO_SKILL_ENUM;

  @Prop({ required: true })
  description: string;
}

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Hero {
  @Prop({ required: true })
  name: string; // 영웅 이름 (예: 루디)

  @Prop({ required: true })
  rank: string; // 등급 (예: 전설)

  @Prop({ required: true })
  type: string; // 유형 (예: HERO_TYPE_ENUM.DEFENSE, HERO_TYPE_ENUM.ATTACK)

  //스킬 배열: 문자열이 아닌 Skill 객체의 배열
  @Prop({ type: [Skill] })
  skills: Skill[];
}

export type HeroDocument = HydratedDocument<Hero>;
export const HeroSchema = SchemaFactory.createForClass(Hero);