import { Controller } from '@nestjs/common';
import { BattlelogService } from './battlelog.service';

@Controller('battlelog')
export class BattlelogController {
  constructor(private readonly battlelogService: BattlelogService) {}
}
