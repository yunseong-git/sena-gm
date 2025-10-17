import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdventwarModule } from './adventwar/adventwar.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { DeckModule } from './deck/deck.module.js';
import { GuildModule } from './guild/guild.module.js';
import { GuildwarModule } from './guildwar/guildwar.module.js';
import { HeroModule } from './hero/hero.module.js';
import { PickModule } from './pick/pick.module.js';
import { RedisModule } from './redis/redis.module.js';
import { UserModule } from './user/user.module.js';


@Module({
  imports: [
    // 1. ConfigModule 설정
    ConfigModule.forRoot({
      isGlobal: true, // 앱 전체에서 ConfigService를 사용할 수 있도록 설정
    }),
    // 2. MongooseModule을 비동기 방식으로 설정
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // MongooseModule에서 ConfigModule을 사용하도록 주입
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), // .env 파일의 MONGO_URI 값을 가져옴
        // useNewUrlParser: true, // 최신 Mongoose에서는 기본값
        // useUnifiedTopology: true,
      }),
      inject: [ConfigService], // useFactory에 ConfigService를 주입
    }),
    UserModule,
    GuildwarModule,
    PickModule,
    HeroModule,
    DeckModule,
    AuthModule,
    GuildModule,
    RedisModule,
    AdventwarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
