import { Module } from '@nestjs/common';
import { GuildService } from './guild.service';
import { GuildController } from './guild.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './schemas/guild.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guild.name, schema: GuildSchema }]),
  ],
  controllers: [GuildController],
  providers: [GuildService],
})
export class GuildModule {}
