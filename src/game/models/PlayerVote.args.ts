import { ArgsType, Field, ID } from '@nestjs/graphql';
import { PlayerVoteInput } from './PlayerVote.input';

@ArgsType()
export class PlayerVoteArgs {
  @Field(() => ID, { description: 'Id of existing game' })
  readonly gameId: string;

  @Field(() => PlayerVoteInput, { description: 'Player vote in game input' })
  readonly input!: PlayerVoteInput;
}
