import { Module } from '@nestjs/common';
import { BattlelogService } from './battlelog.service';
import { BattlelogController } from './battlelog.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BattleLogSchema } from './schemas/battlelog.schema';

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
