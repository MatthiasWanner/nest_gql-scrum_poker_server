import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PlayerVoteInput {
  @Field(() => String, { description: 'JWT session token' })
  partyToken: string;

  @Field(() => Int, { description: 'Player vote' })
  vote: Vote;
}

export enum Vote {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FIVE = 5,
  EIGHT = 8,
  THIRTEEN = 13,
  TWENTYONE = 21,
}
