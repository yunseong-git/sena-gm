import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { DeckSetDto } from '../req/create-record.dto';

@Exclude()
export class RecordResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string; // _id -> id 변환

  @Expose()
  @Transform(({ obj }) => obj.authorId?.nickname ?? 'UNKNOWN')
  authorName: string; // id없이 닉네임만 반환

  @Expose()
  @Type(() => DeckSetDto)
  firstDeck: DeckSetDto;

  @Expose()
  @Type(() => DeckSetDto)
  secondDeck: DeckSetDto;

  @Expose()
  fastSkill: number;

  @Expose()
  winner: number;

  @Expose()
  isFixed: boolean;

  @Expose()
  createdAt: Date;
}