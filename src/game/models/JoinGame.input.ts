import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class JoinGameInput {
  @Field(() => String, { description: 'Name of the new game' })
  gameId: string;

  @Field(() => String, { description: 'Name of the player' })
  username: string;
}
