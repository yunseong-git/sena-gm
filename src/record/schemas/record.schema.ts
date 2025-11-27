import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Query, Types } from "mongoose";
import { ARMOR_MAIN_ENUM, EQUIP_SET_ENUM, EQUIP_SUB_ENUM, RING_ENUM, WEAPON_MAIN_ENUM } from "../../common/constatnts/ring.constant";

// ---------------------------------------------------------
// HeroSet (영웅 1명의 세팅 스냅샷) - _id 불필요
// ---------------------------------------------------------
@Schema({ _id: false })
export class HeroSet {
  @Prop({ required: true })
  heroId: string;

  @Prop({ required: true })
  heroName: string;

  @Prop({ type: String, enum: RING_ENUM })
  ringOption?: RING_ENUM;

  @Prop({ type: String, enum: EQUIP_SET_ENUM })
  setOption?: EQUIP_SET_ENUM;

  // 배열 길이 제한이나 타입은 DTO에서 검증하고, DB엔 단순 배열로 저장
  @Prop({ type: [String], enum: WEAPON_MAIN_ENUM })
  weaponOptions?: WEAPON_MAIN_ENUM[];

  @Prop({ type: [String], enum: ARMOR_MAIN_ENUM })
  armorOptions?: ARMOR_MAIN_ENUM[];

  @Prop({ type: [String], enum: EQUIP_SUB_ENUM })
  subOptions?: EQUIP_SUB_ENUM[];
}
const HeroSetSchema = SchemaFactory.createForClass(HeroSet);

export class SkillOrder {
  heroIndex: number; // 0, 1, 2 (몇 번째 영웅인지)
  skillType: 'S1' | 'S2'; // 어떤 스킬인지
}

// ---------------------------------------------------------
// DeckSet (덱 1개 정보 + Key) - _id 불필요
// ---------------------------------------------------------
@Schema({ _id: false })
export class DeckSet {
  // 검색의 핵심이므로 index: true 설정
  @Prop({ required: true, })
  compositionKey: string; // 예: "colt|evan|kyle"

  @Prop({ type: [HeroSetSchema], required: true })
  heroSets: [HeroSet, HeroSet, HeroSet]; // 튜플 의도

  @Prop({
    type: [{
      heroIndex: { type: Number, required: true, min: 0, max: 2 },
      skillType: { type: String, required: true, enum: ['S1', 'S2'] }
    }],
    validate: [arrayLimit, '{PATH} exceeds the limit of 3'] // (선택) 최대 3개 제한
  })
  skillReservation: SkillOrder[];

  @Prop()
  concept?: string; // 예: "내실덱"
}
const DeckSetSchema = SchemaFactory.createForClass(DeckSet);

//커스텀 검증: 배열길이제한 
function arrayLimit(val) {
  return val.length <= 3;
}

// ---------------------------------------------------------
// Record (메인 컬렉션)
// ---------------------------------------------------------
@Schema({ timestamps: true })
export class Record {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Guild' })
  guildId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  authorId: Types.ObjectId;

  @Prop({ type: DeckSetSchema, required: true })
  firstDeck: DeckSet;

  @Prop({ type: DeckSetSchema, required: true })
  secondDeck: DeckSet;

  // 1: 선공(Left), 2: 후공(Right)
  @Prop({ required: true, min: 1, max: 2 })
  fastSkill: number;

  // 1: FirstDeck 승, 2: SecondDeck 승
  @Prop({ required: true, min: 1, max: 2 })
  winner: number;

  @Prop({ required: true, default: false })
  isPicked: boolean;

  @Prop({ required: true, default: false })
  isDeleted: boolean;
}

export type RecordDocument = HydratedDocument<Record>;
export const RecordSchema = SchemaFactory.createForClass(Record);

// ---------------------------------------------------------
// pre-hooks
// ---------------------------------------------------------
RecordSchema.pre(/^find/, function (this: Query<any, any>, next) { //쿼리객체 명시
  this.where({ isDeleted: false });
  next();
});

// ---------------------------------------------------------
// indexes
// ---------------------------------------------------------
// 1. 최신순
RecordSchema.index({ guildId: 1, createdAt: -1 });

// 2. pick한 데이터들
RecordSchema.index({ guildId: 1, isPicked: -1, createdAt: -1 });

// 3. 검색용 index
RecordSchema.index({ guildId: 1, 'firstDeck.compositionKey': 1, createdAt: -1 });
RecordSchema.index({ guildId: 1, 'secondDeck.compositionKey': 1, createdAt: -1 });

