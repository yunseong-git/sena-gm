import { Public } from '#src/common/decorators/public.decorators.js';
import { Controller, Get, } from '@nestjs/common';
import { HeroService } from '../hero.service.js';

@Public()
@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {
  }
  @Get()
  async findAll() {
    return await this.heroService.findAll();
  }
}