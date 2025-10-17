import { Module } from '@nestjs/common';
import { HeroService } from './hero.service.js';
import { HeroController } from './hero.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Hero, HeroSchema } from './schemas/hero.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hero.name, schema: HeroSchema }]),
  ],
  controllers: [HeroController],
  providers: [HeroService],
})
export class HeroModule {}
