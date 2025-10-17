import { Module } from '@nestjs/common';
import { AdventwarService } from './adventwar.service.js';
import { AdventwarController } from './adventwar.controller.js';

@Module({
  controllers: [AdventwarController],
  providers: [AdventwarService],
})
export class AdventwarModule {}
