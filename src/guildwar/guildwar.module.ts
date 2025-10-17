import { Module } from '@nestjs/common';
import { SessionModule } from './session/session.module.js';
import { BattlelogModule } from './battlelog/battlelog.module.js';
import { OrderModule } from './order/order.module.js';
import { StatusModule } from './status/status.module.js';

@Module({
  imports: [SessionModule, BattlelogModule, OrderModule, StatusModule]
})
export class GuildwarModule {}
