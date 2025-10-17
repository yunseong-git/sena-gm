import { Module } from '@nestjs/common';
import { StatusService } from './status.service.js';
import { StatusController } from './status.controller.js';

@Module({
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
