import { Module } from '@nestjs/common';
import { SessionService } from './session.service.js';
import { SessionController } from './session.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from './schemas/session.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Sessions', schema: SessionSchema }]),
  ],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
