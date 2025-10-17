import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdventwarService } from './adventwar.service.js';

@Controller('adventwar')
export class AdventwarController {
  constructor(private readonly adventwarService: AdventwarService) {}

}
