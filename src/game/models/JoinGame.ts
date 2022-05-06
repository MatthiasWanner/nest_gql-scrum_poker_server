import { ArgsType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class JoinGameInput {
  @Field(() => String, { description: 'Name of the player' })
  username: string;
}

@ArgsType()
export class JoinGameArgs {
  @Field(() => String, { description: 'Game ID' })
  readonly gameId!: string;

  @Field(() => JoinGameInput, { description: 'Join game input' })
  readonly input!: JoinGameInput;
}
