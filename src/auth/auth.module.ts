import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { RedisModule } from '../redis/redis.module';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    //스키마
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    //모듈
    RedisModule,
    UserModule,
    PassportModule,
    //jwt
    JwtModule.registerAsync({
      imports: [ConfigModule], // ConfigService를 사용하기 위해 ConfigModule을 임포트
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'), // 환경 변수에서 값 가져오기
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService], // ConfigService를 주입합니다.
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule { }