import { Module } from '@nestjs/common';
import { PickService } from './pick.service.js';
import { PickController } from './pick.controller.js';

@Module({
  controllers: [PickController],
  providers: [PickService],
})
export class PickModule {}
