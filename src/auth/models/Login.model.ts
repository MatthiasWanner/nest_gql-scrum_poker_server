import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Login {
  @Field(() => String, { description: 'Id of existing user' })
  userId: string;

  @Field(() => String, { description: 'Id of playing party' })
  partyId: string;

  @Field(() => String, { description: 'Username send in body' })
  username: string;

  @Field(() => String, { description: 'Signed JWT Token' })
  accessToken: string;
}
