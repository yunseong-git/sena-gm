import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtBlacklistGuard } from './guards/jwt-blacklist.guard';
import { TestUser, TestUserSchema } from 'src/user/schemas/user.schema';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RedisModule } from 'src/redis/redis.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    //스키마 등록
    MongooseModule.forFeature([{ name: TestUser.name, schema: TestUserSchema }]),

    RedisModule,

    JwtModule.registerAsync({
      imports: [ConfigModule], // ConfigService를 사용하기 위해 ConfigModule을 임포트
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'), // 환경 변수에서 값 가져오기
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService], // ConfigService를 주입합니다.
    }),

    //jwtGuard용 passport
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtBlacklistGuard
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }