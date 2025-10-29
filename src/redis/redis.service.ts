import { Inject, Injectable } from '@nestjs/common';
import * as ioredis from 'ioredis';
import { Types } from 'mongoose';
import { REDIS_CLIENT } from './redis.constants.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: ioredis.Redis,
    private readonly configService: ConfigService,
  ) { }

  /**
   * 특정 유저를 블랙리스트에 추가
   * @param userId 블랙리스트에 추가할 유저의 ID
   */
  async setRefreshList(userId: Types.ObjectId | string): Promise<void> {
    // Redis 키는 'prefix:id' 형태로 만드는 것이 일반적(ex: blacklist:6528d...)
    const key = `blacklist:${userId.toString()}`;
    const value = 'blacklisted'; // 값은 중요하지 않지만, 추적을 위해 의미있는 값을 씀
    const ttl = this.configService.get<number>('BLACKLIST_TTL');
    if (!ttl) throw new Error('BLACKLIST_TTL 환경 변수가 설정되지 않았습니다.');

    //초단위
    await this.redis.set(key, value, 'EX', ttl);
  }

  /**
 * 특정 유저를 블랙리스트에서 제거
 * @param userId 블랙리스트에서 제거할 유저의 ID
 */
  async removeFromBlacklist(userId: Types.ObjectId | string): Promise<void> {
    const key = `blacklist:${userId.toString()}`;
    await this.redis.del(key);
  }

}
