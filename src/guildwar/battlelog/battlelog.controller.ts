import { Controller } from '@nestjs/common';
import { BattlelogService } from './battlelog.service.js';

@Controller('battlelog')
export class BattlelogController {
  constructor(private readonly battlelogService: BattlelogService) {}
}
