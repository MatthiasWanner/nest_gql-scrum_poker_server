import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisCacheResponse } from './interfaces/redis.interfaces';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T> {
    return await this.cache.get(key);
  }

  async set<T>(key: string, value: T): Promise<RedisCacheResponse> {
    return await this.cache.set(key, value, 1000);
  }

  async reset() {
    await this.cache.reset();
  }

  async del(key: string) {
    await this.cache.del(key);
  }
}
