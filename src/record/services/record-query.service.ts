import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from '../schemas/record.schema';
import { Model } from 'mongoose';
import { UserPayload } from '../../auth/interfaces/token-payload.interface';
import { RecordResponseDto } from '../dto/res/get-record-res.dto';
import { plainToInstance } from 'class-transformer';
import { SearchRecordDto } from '../dto/req/search-record.dto';
import { PaginationDto } from '../dto/req/pagination.dto';
import { PaginatedResponseDto } from '../dto/res/paginated-res.dto';

@Injectable()
export class RecordQueryService {
  constructor(
    @InjectModel(Record.name) private recordModel: Model<Record>,
  ) { }

  /**고정글 조회 (개수가 적으니 한 번에 다 줌)*/
  async findPickedRecords(user: UserPayload): Promise<RecordResponseDto[]> {
    const records = await this.recordModel
      .find({
        guildId: user.guildId,
        isPicked: true
      })
      .sort({ createdAt: -1 })
      .populate('authorId', 'nickname')
      .lean()
      .exec();

    return plainToInstance(RecordResponseDto, records, {
      excludeExtraneousValues: true,
    });
  }

  /**전체 조회 (최신순,pagination) */
  async findAll(
    user: UserPayload,
    paginationDto: PaginationDto
  ): Promise<PaginatedResponseDto<RecordResponseDto>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const filter = { guildId: user.guildId };

    const total = await this.recordModel.countDocuments(filter);

    const records = await this.recordModel
      .find(filter)
      .sort({ createdAt: -1 }) // 🚀 isPicked 정렬 뺌! 무조건 최신순
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'nickname')
      .lean()
      .exec();

    const dtos = plainToInstance(RecordResponseDto, records, {
      excludeExtraneousValues: true,
    });

    return new PaginatedResponseDto(dtos, total, page, limit);
  }

  async search(user: UserPayload, dto: SearchRecordDto): Promise<RecordResponseDto[]> {
    // 1. 검색 키 생성 (저장할 때와 똑같은 로직: 정렬 -> 합치기)
    // 예: ['kyle', 'evan', 'colt'] -> "colt|evan|kyle"
    const searchKey = dto.heroIds.sort().join('|');

    // 2. 쿼리 실행
    // firstDeck이나 secondDeck 둘 중 하나라도 해당 키를 가지고 있으면 가져옴 ($or)
    const records = await this.recordModel
      .find({
        guildId: user.guildId, // 우리 길드 데이터만
        $or: [
          { 'firstDeck.compositionKey': searchKey },
          { 'secondDeck.compositionKey': searchKey },
        ],
      })
      .sort({ createdAt: -1 }) // 최신순
      .populate('authorId', 'nickname')
      .lean().exec();

    // 3. DTO 변환
    return plainToInstance(RecordResponseDto, records, { excludeExtraneousValues: true, });
  }
}
