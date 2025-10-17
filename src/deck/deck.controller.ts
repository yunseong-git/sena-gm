import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeckService } from './deck.service.js';

@Controller('deck')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

}
