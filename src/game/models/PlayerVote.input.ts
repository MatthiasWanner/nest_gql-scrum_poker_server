import { Field, InputType, registerEnumType } from '@nestjs/graphql';

@InputType()
export class PlayerVoteInput {
  @Field(() => Vote, { description: 'Player vote' })
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

registerEnumType(Vote, {
  name: 'Vote',
  description: 'Player vote according to a fibonacci sequence',
});
