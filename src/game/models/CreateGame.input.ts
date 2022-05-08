import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateGameInput {
  @Field(() => String, { description: 'Name of the player' })
  username: string;

  @Field(() => String, { description: 'Name of the new game' })
  gameName: string;

  @Field(() => Int, { description: 'Max players allowed', nullable: true })
  maxPlayers?: number = 10;
}
