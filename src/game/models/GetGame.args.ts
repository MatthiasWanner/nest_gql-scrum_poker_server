import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class GetGameArgs {
  @Field(() => ID, { description: 'Game id' })
  readonly gameId!: string;
}
