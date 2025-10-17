import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { TestUser, TestUserSchema } from './schemas/user.schema.js';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestUser.name, schema: TestUserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
