import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserRole } from 'src/user/models';

@ObjectType()
export class Login {
  @Field(() => ID, { description: 'Id of existing user' })
  userId: string;

  @Field(() => ID, { description: 'Id of playing game' })
  gameId: string;

  @Field(() => String, { description: 'Username send in body' })
  username: string;

  /**
   * @description User role
   * @description This field will be deleted if database is implemented
   */
  @Field(() => UserRole, { description: 'User role' })
  readonly role: UserRole;

  @Field(() => String, { description: 'Signed JWT Token' })
  accessToken: string;
}
