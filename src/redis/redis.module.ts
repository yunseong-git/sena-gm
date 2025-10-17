import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // ConfigService를 임포트합니다.
import * as ioredis from 'ioredis';
import { RedisService } from './redis.service.js';
import { REDIS_CLIENT } from './redis.constants.js';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      // useFactory가 의존하는 서비스를 inject 배열에 추가
      // useFactory는 inject된 서비스를 인자로 받음
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('UPSTASH_REDIS_URL');

        if (!redisUrl) {
          throw new Error('UPSTASH_REDIS_URL 환경 변수가 설정되지 않았습니다.');
        }
        return new ioredis.Redis(redisUrl);
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule { }
