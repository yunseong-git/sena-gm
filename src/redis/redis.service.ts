import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Types } from 'mongoose';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }
  /**
   * 특정 유저를 블랙리스트에 추가
   * @param userId 블랙리스트에 추가할 유저의 ID
   * @param ttl 만료 시간 (Time To Live, 초 단위)
   */
  async blacklistUser(userId: Types.ObjectId | string, ttl: number): Promise<void> {
    // Redis 키는 'prefix:id' 형태로 만드는 것이 일반적(ex: blacklist:6528d...)
    const key = `blacklist:${userId.toString()}`;
    const value = 'blacklisted'; // 값은 중요하지 않지만, 추적을 위해 의미있는 값을 씁니다.

    // 'EX'는 만료 시간을 '초' 단위로 설정하라는 명령어입니다.
    await this.redis.set(key, value, 'EX', ttl);
  }
}
