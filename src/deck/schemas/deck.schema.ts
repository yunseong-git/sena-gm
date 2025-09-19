import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**<MainDocument> 덱조합*/
@Schema({ timestamps: true, collection: 'Decks' })
export class Deck {
  @Prop({
    required: true,
    type: [Types.ObjectId],
    ref: 'Heroes',
    validate: [(arr: Types.ObjectId[] | any[]) => arr.length === 3], // 항상 3명의 영웅인지 검증'Deck must have exactly 3 heroes.'
  })
  heroes: Types.ObjectId[];
}

export type DeckDocument = HydratedDocument<Deck>;
export const DeckSchema = SchemaFactory.createForClass(Deck);

// 정렬된 heroes 배열에 대해 복합 인덱스(배열이어도 복합임) 설정
DeckSchema.index({ heroes: 1 }, { unique: true });
