import { Public } from '../../common/decorators/public.decorators';
import { Controller, Get, } from '@nestjs/common';
import { HeroService } from '../hero.service';

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