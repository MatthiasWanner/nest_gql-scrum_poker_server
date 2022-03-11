import { ArgsType, Field } from '@nestjs/graphql';
import { PlayerVoteInput } from './PlayerVote.input';

@ArgsType()
export class PlayerVoteArgs {
  @Field(() => PlayerVoteInput, { description: 'Player vote in party input' })
  readonly input!: PlayerVoteInput;
}
