import { ArgsType, Field } from '@nestjs/graphql';
import { PlayerVoteInput } from './PlayerVote.input';

@ArgsType()
export class PlayerVoteArgs {
  @Field(() => String, { description: 'Id of existing game' })
  readonly gameId: string;

  @Field(() => PlayerVoteInput, { description: 'Player vote in game input' })
  readonly input!: PlayerVoteInput;
}
