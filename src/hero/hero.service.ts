import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateHeroDto } from './dto/create-hero.dto.js';
import { HeroesData } from './heroes.data.js';
import { Hero, HeroDocument, RankOrder, TypeOrder } from './schemas/hero.schema.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateHeroDto } from './dto/update-hero.dto.js';

@Injectable()
export class HeroService {
  constructor(@InjectModel(Hero.name) private heroModel: Model<HeroDocument>) { }

  async seedHeroes(): Promise<{ message: string; count: number }> {
    try {
      await this.heroModel.deleteMany({});

      const result = await this.heroModel.insertMany(HeroesData);

      return {
        message: 'Hero data seeded successfully.',
        count: result.length,
      };
    } catch (error) {
      console.error('Failed to seed heroes:', error);
      throw new InternalServerErrorException('Failed to seed hero data.');
    }
  }

  async findAll(): Promise<Hero[]> {
    const heroes = await this.heroModel.find().lean().exec();

    return heroes.sort((a, b) => {
      // [1단계] 등급 비교
      const rankA = RankOrder[a.rank] ?? 99;
      const rankB = RankOrder[b.rank] ?? 99;
      if (rankA !== rankB) return rankA - rankB;

      // [2단계] 타입 비교
      const typeA = TypeOrder[a.type] ?? 99;
      const typeB = TypeOrder[b.type] ?? 99;
      if (typeA !== typeB) return typeA - typeB;

      // [3단계] 이름 가나다순 비교
      return a.name.localeCompare(b.name, 'ko');
    });
  }

  async create(createHeroDto: CreateHeroDto): Promise<HeroDocument> {
    const newHero = new this.heroModel(createHeroDto);
    return newHero.save();
    // (참고: unique 필드(name)가 중복되면 Mongoose가 자동으로 에러 발생)
  }

  async update(
    id: string,
    updateHeroDto: UpdateHeroDto,
  ): Promise<HeroDocument> {
    const hero = await this.heroModel.findByIdAndUpdate(id, updateHeroDto, {
      new: true,
    });

    if (!hero) {
      throw new NotFoundException(`Hero with ID "${id}" not found.`);
    }
    return hero;
  }
}
