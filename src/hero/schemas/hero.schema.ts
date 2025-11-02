import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum HeroType {
  allround = '만능형',
  defense = '방어형',
  attack = '공격형',
  support = '지원형',
  magic = '마법형',
}

export enum HeroRank {
  sssr = '구세나',
  ssr = '찐스',
  sr = '짭스',
  r = '희귀',
}

export enum SkillType {
  first_active = '1스킬',
  second_active = '2스킬',
  attack = '기본공격',
  passive = '패시브',
}

/**<SubDocument>스킬디테일*/
@Schema({ _id: false })
export class Skill {
  @Prop({ required: true, type: String, enum: SkillType })
  type: string;

  @Prop({ required: true, type: String })
  description: string;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);

/**<MainDocument> 영웅정보*/
@Schema({ timestamps: true, collection: 'Heroes' })
export class Hero {
  @Prop({ required: true, unique: true, type: String })
  name: string;

  @Prop({ required: true, type: String, enum: HeroType })
  type: string;

  @Prop({ required: true, type: String, enum: HeroRank })
  rank: string;

  @Prop({ required: true, type: [SkillSchema] })
  skills: Skill[];
}

export type HeroDocument = HydratedDocument<Hero>;
export const HeroSchema = SchemaFactory.createForClass(Hero);

HeroSchema.index({ rank: 1, type: 1 });
