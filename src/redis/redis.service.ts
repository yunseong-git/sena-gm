import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import * as ioredis from 'ioredis';
import { Types } from 'mongoose';
import { REDIS_CLIENT } from '../common/constatnts/redis.constant.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: ioredis.Redis,
    private readonly logger = new Logger(RedisService.name),
    private readonly configService: ConfigService,
  ) { }

  // --- strict logic ---
  // redis 죽으면 error Throw

  async getOrThrow(userId: Types.ObjectId | string): Promise<string | null> {
    try {
      const key = `user:state-patch:${userId.toString()}`;
      return await this.redis.get(key);
    } catch (e) {
      this.logger.error(`Redis GET failed: ${userId.toString()}`, e);
      throw new ServiceUnavailableException('서버 문제로 현재 해당 서비스를 사용할 수 없습니다.');
    }
  }

  /**list에 set, 실패시 throw */
  async setOrThrow(userId: Types.ObjectId | string): Promise<void> {
    try {
      const key = `user:state-patch:${userId.toString()}`;
      const value = '1'; //걍 의미 없음, 데이터절약이나
      const ttl = this.configService.getOrThrow<number>('STATEPATCHLIST_TTL');

      await this.redis.set(key, value, 'EX', ttl);
    } catch (e) {
      this.logger.error(`Redis SET failed: ${userId.toString()}`, e);
      throw new ServiceUnavailableException('서버 문제로 현재 해당 서비스를 사용할 수 없습니다.');
    }
  }

  /**list에 set, 실패시 throw */
  async delOrThrow(userId: Types.ObjectId | string): Promise<void> {
    try {
      const key = `user:state-patch:${userId.toString()}`;
      await this.redis.del(key);
    } catch (e) {
      this.logger.error(`Redis DEL failed: ${userId.toString()}`, e);
      throw new ServiceUnavailableException('서버 문제로 현재 해당 서비스를 사용할 수 없습니다.');
    }
  }

  // --- safe logic ---
  // redis가 죽어도 null

  /**list에 set, 실패시 not throw */
  async safeSet(userId: Types.ObjectId | string): Promise<void> {
    try {
      const key = `user:state-patch:${userId.toString()}`;
      const value = '1'; //걍 의미 없음, 데이터절약이나
      const ttl = this.configService.getOrThrow<number>('STATEPATCHLIST_TTL');

      await this.redis.set(key, value, 'EX', ttl);
    } catch (e) {
      this.logger.error(`Redis SET failed: ${userId.toString()}`, e);
    }
  }

  /**list에 del, 실패시 not throw */
  async safeDel(userId: Types.ObjectId | string): Promise<void> {
    try {
      const key = `user:state-patch:${userId.toString()}`;
      await this.redis.del(key);
    } catch (e) {
      this.logger.error(`Redis DEL failed: ${userId.toString()}`, e);
    }
  }

  /**list에 get, 실패시 not throw */
  async safeGet(userId: Types.ObjectId | string): Promise<string | null> {
    try {
      const key = `user:state-patch:${userId.toString()}`;
      return await this.redis.get(key);
    } catch (e) {
      this.logger.error(`Redis GET failed: ${userId.toString()}`, e);
      return null;
    }
  }
}
