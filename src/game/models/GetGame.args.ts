import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetGameArgs {
  @Field(() => String, { description: 'Game id' })
  readonly gameId!: string;
}
