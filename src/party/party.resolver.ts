import {
  Args,
  Context,
  Mutation,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { CreatePartyInput } from './models/CreatePartyInput.models';

@Resolver('Party')
export class PartyResolver {
  private messages = [];

  @Subscription(() => [String], { name: 'partyCreated' })
  subscribeToPartyCreated(@Context('pubsub') pubSub: RedisPubSub) {
    return pubSub.asyncIterator('partyCreated');
  }

  @Mutation(() => [String])
  createParty(
    @Context('pubsub') pubSub: RedisPubSub,
    @Args('input', { nullable: false, type: () => CreatePartyInput })
    { message }: CreatePartyInput,
  ) {
    this.messages.push(message);
    pubSub.publish('partyCreated', { partyCreated: this.messages });
    return this.messages;
  }
}
