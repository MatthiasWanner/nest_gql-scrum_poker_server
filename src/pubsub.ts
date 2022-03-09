import Redis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import config from './configuration';

const { redisHost: host, redisPort: port } = config();

const redisOptions = {
  host,
  port,
};

export const pubsub = new RedisPubSub({
  publisher: new Redis(redisOptions),
  subscriber: new Redis(redisOptions),
});
