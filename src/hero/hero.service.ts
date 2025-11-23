import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateHeroDto } from './dto/create-hero.dto.js';
import { HeroesData } from './heroes.data.js';
import { Hero, HeroDocument } from './schemas/hero.schema.js';
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
    return await this.heroModel.find().lean().exec();
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
