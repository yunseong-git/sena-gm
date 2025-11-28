import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum HERO_SKILL_ENUM {
  SKILL_1 = 's1',
  SKILL_2 = 's2',
  BASIC = 'basic',
  PASSIVE = 'passive',
}

export enum HERO_RANK_ENUM {
  UR = 'ur',
  SSR = 'ssr',
  SR = 'sr',
  R = 'r'
}
export enum HERO_TYPE_ENUM {
  DEFENSE = 'defense',
  ATTACK = 'attack',
  SUPPORT = 'support',
  MAGIC = 'magic',
  ALLROUND = 'allround'
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

@Schema({ _id: false })
export class SkillDetail {
  @Prop({ required: true })
  description: string;
}

@Schema({ _id: false }) // 스킬 객체 자체는 ID가 필요 없음
export class Skills {
  @Prop({ type: SkillDetail, required: true })
  [HERO_SKILL_ENUM.SKILL_1]: SkillDetail; // 's1'

  @Prop({ type: SkillDetail, required: true })
  [HERO_SKILL_ENUM.SKILL_2]: SkillDetail; // 's2'

  @Prop({ type: SkillDetail, required: true })
  [HERO_SKILL_ENUM.BASIC]: SkillDetail; // 'basic'

  @Prop({ type: SkillDetail, required: true })
  [HERO_SKILL_ENUM.PASSIVE]: SkillDetail; // 'passive'
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
  @Prop({ type: Skills, required: true })
  skills: Skills;
}

export type HeroDocument = HydratedDocument<Hero>;
export const HeroSchema = SchemaFactory.createForClass(Hero);