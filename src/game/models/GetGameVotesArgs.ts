import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetGameVotesArgs {
  @Field(() => String, { description: 'Game id' })
  readonly id!: string;

  @Field(() => String, { description: 'JWT session token' })
  readonly accessToken!: string;
}
