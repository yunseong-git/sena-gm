import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // ConfigService를 임포트합니다.
import * as ioredis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from '../common/constatnts/redis.constant';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      // useFactory가 의존하는 서비스를 inject 배열에 추가
      // useFactory는 inject된 서비스를 인자로 받음
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('UPSTASH_REDIS_URL');
        return new ioredis.Redis(redisUrl, { enableOfflineQueue: false }); //연결 끊기면 큐에 쌓지말고 걍 에러
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule { }
