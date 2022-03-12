import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisCacheResponse } from './interfaces/redis.interfaces';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const res = await this.cache.get<T>(key);
    if (res) {
      return res;
    }
    return null;
  }

  async set<T>(key: string, value: T): Promise<RedisCacheResponse> {
    const status = await this.cache.set<T>(key, value);
    if (status === 'OK') {
      return 'OK';
    }
    return 'FAILED';
  }

  async reset() {
    await this.cache.reset();
  }

  async del(key: string) {
    await this.cache.del(key);
  }
}
