import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';
import { Status } from './Game.model';

@InputType()
export class UpdateGameInput {
  @Field(() => String, { description: 'New name of the game', nullable: true })
  readonly gameName?: string;

  @Field(() => Status, {
    description: 'New status of the game',
    nullable: true,
  })
  readonly status?: Status;

  @Field(() => [ID], {
    description: 'Array of user IDs to be deleted',
    nullable: true,
  })
  readonly deleteUsers?: string[];
}

@ArgsType()
export class UpdateGameArgs {
  @Field(() => ID, { description: 'Id of existing game' })
  readonly gameId: string;

  @Field(() => UpdateGameInput, {
    description: 'Input containing updated game datas',
  })
  readonly input!: UpdateGameInput;
}
