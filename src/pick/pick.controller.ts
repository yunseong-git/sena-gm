import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PickService } from './pick.service.js';

@Controller('pick')
export class PickController {
  constructor(private readonly pickService: PickService) {}

}
