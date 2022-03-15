import { ArgsType, Field } from '@nestjs/graphql';
import { CreateGameInput } from './CreateGame.input';

@ArgsType()
export class CreateGameArgs {
  @Field(() => CreateGameInput, { description: 'Create game input' })
  readonly input!: CreateGameInput;
}
