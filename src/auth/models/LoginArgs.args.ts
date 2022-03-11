import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class LoginArgs {
  @Field(() => String, { description: 'Id of existing user' })
  readonly userId: string;

  @Field(() => String, { description: 'Id of playing party' })
  readonly partyId: string;

  @Field(() => String, { description: 'Username send in body' })
  readonly username: string;
}
