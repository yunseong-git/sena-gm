import { Module } from '@nestjs/common';
import { DeckService } from './deck.service.js';
import { DeckController } from './deck.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { DeckSchema } from './schemas/deck.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Decks', schema: DeckSchema }])],
  controllers: [DeckController],
  providers: [DeckService],
})
export class DeckModule {}
