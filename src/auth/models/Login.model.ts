import { Field, ObjectType } from '@nestjs/graphql';
import { UserRoles } from 'src/constants';

@ObjectType()
export class Login {
  @Field(() => String, { description: 'Id of existing user' })
  userId: string;

  @Field(() => String, { description: 'Id of playing game' })
  gameId: string;

  @Field(() => String, { description: 'Username send in body' })
  username: string;

  /**
   * @description User role
   * @description This field will be deleted if database is implemented
   */
  @Field(() => String, { description: 'User role' })
  readonly role: UserRoles;

  @Field(() => String, { description: 'Signed JWT Token' })
  accessToken: string;
}
