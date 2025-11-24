import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { GuildModule } from './guild/guild.module.js';
import { HeroModule } from './hero/hero.module.js';
import { RedisModule } from './redis/redis.module.js';
import { UserModule } from './user/user.module.js';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import * as Joi from 'joi';


@Module({
  imports: [
    // 환경변수 전역설정 및 점검
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION: Joi.number().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION: Joi.number().required(),
        BCRYPT_SALT_ROUNDS: Joi.number().required(),
      }),
    }),
    // DB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    //modules
    UserModule,
    HeroModule,
    AuthModule,
    GuildModule,
    RedisModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    { //전역가드
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
