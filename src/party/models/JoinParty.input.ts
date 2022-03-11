import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class JoinPartyInput {
  @Field(() => String, { description: 'Name of the new party' })
  partyId: string;

  @Field(() => String, { description: 'Name of the player' })
  username: string;
}
