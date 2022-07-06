import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisCacheService } from './redis-cache.service';
import * as redisStore from 'cache-manager-redis-store';
import { REDIS_PUBSUB_CLIENT } from 'src/constants';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { RedisPubSubService } from './redis-pubsub.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        auth_pass: configService.get('REDIS_PASSWORD'),
        ttl: +configService.get('CACHE_TTL'),
        max: +configService.get('MAX_ITEM_IN_CACHE'),
      }),
    }),
  ],
  providers: [
    RedisCacheService,
    {
      provide: REDIS_PUBSUB_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisOptions: Redis.RedisOptions = {
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        };

        return new RedisPubSub({
          publisher: new Redis(redisOptions),
          subscriber: new Redis(redisOptions),
          connection: redisOptions,
        });
      },
    },
    RedisPubSubService,
  ],
  exports: [RedisCacheService, RedisPubSubService],
})
export class RedisModule {}
