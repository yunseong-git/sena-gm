import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HeroService } from './hero.service.js';
import { CreateHeroDto } from './dto/create-hero.dto.js';

@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Post()
  create(@Body() createHeroDto: CreateHeroDto) {
    return this.heroService.create(createHeroDto);
  }

  @Post('Bulk')
  async createBulk() {
    return await this.heroService.createBulk();
  }
}
