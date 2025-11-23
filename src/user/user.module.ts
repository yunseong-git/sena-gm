import { Global, Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema.js';
import { UserService } from './services/user.service.js';
import { UserGuildService } from './services/user-guild.service.js';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserGuildService],
  exports: [UserService, UserGuildService],
})
export class UserModule { }
