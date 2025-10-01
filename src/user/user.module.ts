import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TestUser, TestUserSchema } from './schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestUser.name, schema: TestUserSchema },
    ]),

    // AuthGuard를 사용하기 위해 PassportModule과 AuthModule을 임포트합니다.
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
