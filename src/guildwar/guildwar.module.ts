import { Module } from '@nestjs/common';
import { SessionModule } from './session/session.module';
import { BattlelogModule } from './battlelog/battlelog.module';
import { OrderModule } from './order/order.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [SessionModule, BattlelogModule, OrderModule, StatusModule]
})
export class GuildwarModule {}
