import { Controller } from '@nestjs/common';
import { StatusService } from './status.service.js';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}
}
