import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtBlacklistGuard } from './guards/jwt-blacklist.guard.js';
import { TestUser, TestUserSchema } from '#src/user/schemas/user.schema.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { RedisModule } from '#src/redis/redis.module.js';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js';
import { UserModule } from '#src/user/user.module.js';

@Module({
  imports: [
    //스키마
    MongooseModule.forFeature([{ name: TestUser.name, schema: TestUserSchema }]),
    //모듈
    RedisModule,
    UserModule,
    PassportModule,
    //jwt
    JwtModule.registerAsync({
      imports: [ConfigModule], // ConfigService를 사용하기 위해 ConfigModule을 임포트
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'), // 환경 변수에서 값 가져오기
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
    JwtBlacklistGuard
  ],
  exports: [AuthService, JwtBlacklistGuard],
})
export class AuthModule { }