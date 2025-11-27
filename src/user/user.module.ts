import { Global, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './services/user.service';
import { UserGuildService } from './services/user-guild.service';
import { UserTestService } from './services/user-test.service';
import { Counter, CounterSchema } from '../common/schemas/counter.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Counter.name, schema: CounterSchema }
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserGuildService, UserTestService],
  exports: [UserService, UserGuildService, UserTestService],
})
export class UserModule { }
