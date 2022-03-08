import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CreatePartyInput } from './models/CreatePartyInput.models';

const pubSub = new PubSub();
const messages = [];

@Resolver('Party')
export class PartyResolver {
  @Subscription(() => [String], { name: 'partyCreated' })
  subscribeToPartyCreated() {
    return pubSub.asyncIterator('partyCreated');
  }

  @Mutation(() => [String])
  createParty(
    @Args('input', { nullable: false, type: () => CreatePartyInput })
    { message }: CreatePartyInput,
  ) {
    messages.push(message);
    pubSub.publish('partyCreated', { partyCreated: messages });
    return messages;
  }
}
