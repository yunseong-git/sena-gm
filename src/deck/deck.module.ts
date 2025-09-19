import { Module } from '@nestjs/common';
import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DeckSchema } from './schemas/deck.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Decks', schema: DeckSchema }])],
  controllers: [DeckController],
  providers: [DeckService],
})
export class DeckModule {}
