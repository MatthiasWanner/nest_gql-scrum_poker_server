import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from 'src/party/models';

@ObjectType()
export class Login {
  @Field(() => String, { description: 'Id of existing user' })
  userId: string;

  @Field(() => String, { description: 'Id of playing party' })
  partyId: string;

  @Field(() => String, { description: 'Username send in body' })
  username: string;

  /**
   * @description User role
   * @description This field will be deleted if database is implemented
   */
  @Field(() => String, { description: 'User role' })
  readonly role: Role;

  @Field(() => String, { description: 'Signed JWT Token' })
  accessToken: string;
}
