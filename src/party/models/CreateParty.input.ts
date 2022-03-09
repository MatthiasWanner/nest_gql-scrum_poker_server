import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePartyInput {
  @Field(() => String, { description: 'Name of the player' })
  username: string;

  @Field(() => String, { description: 'Name of the new party' })
  partyName: string;
}
