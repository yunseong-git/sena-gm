import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordCommandService } from './services/record-command.service';
import { RecordQueryService } from './services/record-query.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Record, RecordSchema } from './schemas/record.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Record.name, schema: RecordSchema },
  ]),
  ],
  controllers: [RecordController],
  providers: [RecordCommandService, RecordQueryService],
})
export class RecordModule { }
