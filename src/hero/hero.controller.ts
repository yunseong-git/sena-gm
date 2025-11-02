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

@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) { }
  @Post('Bulk')
  async createBulk() {
    return await this.heroService.createBulk();
  }
}
