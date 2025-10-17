import { Module } from '@nestjs/common';
import { BattlelogService } from './battlelog.service.js';
import { BattlelogController } from './battlelog.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { BattleLogSchema } from './schemas/battlelog.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BattleLogs', schema: BattleLogSchema },
    ]),
  ],
  controllers: [BattlelogController],
  providers: [BattlelogService],
})
export class BattlelogModule {}
