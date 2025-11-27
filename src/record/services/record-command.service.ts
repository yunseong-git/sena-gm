import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from '../schemas/record.schema';
import { Model } from 'mongoose';
import { UserPayload } from '../../auth/interfaces/token-payload.interface';
import { CreateRecordDto, DeckSetDto } from '../dto/req/create-record.dto';

@Injectable()
export class RecordCommandService {
  constructor(
    @InjectModel(Record.name) private recordModel: Model<Record>,
  ) { }

  async create(user: UserPayload, dto: CreateRecordDto): Promise<void> {
    const { id, guildId } = user;

    // 1. DeckSet을 DB 스키마 형태로 변환 (Key 생성 포함)
    const firstDeckWithKey = this._transformToDeckSchema(dto.firstDeck);
    const secondDeckWithKey = this._transformToDeckSchema(dto.secondDeck);

    // 2. DB 저장
    const newRecord = new this.recordModel({
      guildId,
      authorId: id,
      firstDeck: firstDeckWithKey,
      secondDeck: secondDeckWithKey,
      fastSkill: dto.fastSkill,
      winner: dto.winner,
      isPicked: false,
    });

    await newRecord.save();
  }

  async pick(user: UserPayload, recordId: string): Promise<void> {
    const { guildId } = user; // payload에서 guildId 추출

    // 1. 업데이트 실행
    const result = await this.recordModel.updateOne(
      {
        _id: recordId,
        guildId: guildId // 내 길드의 기록만 수정 가능
      },
      {
        $set: { isPicked: true } // isPicked를 true로 설정
      }
    ).exec();

    //
    if (result.matchedCount === 0) {
      throw new NotFoundException('기록을 찾을 수 없거나 해당 길드의 기록이 아닙니다.');
    }
  }

  async delete(user: UserPayload, recordId: string): Promise<void> {
    const { guildId } = user;

    const result = await this.recordModel.updateOne(
      {
        _id: recordId,
        guildId: guildId // 내 길드의 글인지 확인
      },
      {
        $set: { isDeleted: true }
      }
    ).exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('기록을 찾을 수 없거나 삭제 권한이 없습니다.');
    }
  }

  // [Helper] DTO -> Schema 변환 및 Key 생성 로직
  private _transformToDeckSchema(deckDto: DeckSetDto) {
    // 영웅 ID 추출 및 정렬 (오름차순)
    // 예: ['kyle', 'evan', 'colt'] -> ['colt', 'evan', 'kyle']
    const sortedHeroIds = deckDto.heroSets
      .map((h) => h.heroId)
      .sort();

    // compositionKey 생성
    const compositionKey = sortedHeroIds.join('|');

    // 기존 DTO 데이터에 Key를 추가해서 반환
    return {
      ...deckDto,
      compositionKey,
    };
  }
}
