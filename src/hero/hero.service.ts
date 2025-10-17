import { ConflictException, Injectable } from '@nestjs/common';
import { CreateHeroDto } from './dto/create-hero.dto.js';
import { heroesData } from './schemas/hero.data.js';
import { Hero, HeroDocument } from './schemas/hero.schema.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class HeroService {
  constructor(@InjectModel(Hero.name) private heroModel: Model<HeroDocument>) {}

  create(createHeroDto: CreateHeroDto) {
    return 'This action adds a new hero';
  }

  async createBulk() {
    try {
      // insertMany를 사용하여 배열 전체를 한 번에 삽입합니다.
      // ordered: false 옵션은 중간에 중복 오류가 발생해도 멈추지 않고 나머지를 모두 시도하게 합니다.
      const result = await this.heroModel.insertMany(heroesData, {
        ordered: false,
      });
      return {
        message: `${result.length}명의 영웅이 성공적으로 추가되었습니다.`,
      };
    } catch (error) {
      // name 필드에 unique 인덱스가 있으므로, 이미 데이터가 존재하면 에러가 발생합니다.
      if (error.code === 11000) {
        // MongoBulkWriteError는 error.insertedDocs를 통해 일부 성공한 문서를 알 수 있습니다.
        const insertedCount = error.result?.nInserted ?? 0;
        throw new ConflictException(
          `데이터가 이미 존재합니다. 새로운 ${insertedCount}명의 영웅만 추가되었습니다.`,
        );
      }
      // 그 외 다른 에러는 그대로 다시 던집니다.
      throw error;
    }
  }
}
