import { Global, Module } from '@nestjs/common';
import { UserService } from './profile/user.service.js';
import { UserController } from './profile/user.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './profile/schemas/user.schema.js';
import { UserPowerController } from './power/user-power.controller.js';
import { UserPower, UserPowerSchema } from './power/schemas/user-power.schema.js';
import { UserPowerService } from './power/user-power.service.js';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserPower.name, schema: UserPowerSchema }
    ]),
  ],
  controllers: [UserController, UserPowerController],
  providers: [UserService, UserPowerService],
  exports: [UserService],
})
export class UserModule { }
