import { Module } from '@nestjs/common';
import { HeroService } from './hero.service';
import { HeroController } from './controllers/hero.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Hero, HeroSchema } from './schemas/hero.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hero.name, schema: HeroSchema }]),
  ],
  controllers: [HeroController],
  providers: [HeroService],
})
export class HeroModule { }
