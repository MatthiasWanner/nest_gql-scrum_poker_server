import { Inject, Injectable } from '@nestjs/common';
import { REDIS_PUBSUB_CLIENT } from '@constants/index';

@Injectable()
export class RedisPubSubService {
  constructor(@Inject(REDIS_PUBSUB_CLIENT) private readonly pubsub: any) {}

  subscribe(channel: string) {
    return this.pubsub.asyncIterator(channel);
  }

  publish(channel: string, payload: { [key: string]: any }) {
    return this.pubsub.publish(channel, payload);
  }
}
