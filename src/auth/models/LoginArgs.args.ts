import { ArgsType, Field } from '@nestjs/graphql';
import { Role } from 'src/party/models';

@ArgsType()
export class LoginArgs {
  @Field(() => String, { description: 'Id of existing user' })
  readonly userId: string;

  @Field(() => String, { description: 'Id of playing party' })
  readonly partyId: string;

  @Field(() => String, { description: 'Username send in body' })
  readonly username: string;

  /**
   * @description User role
   * @description This field will be deleted if database is implemented
   */
  @Field(() => String, { description: 'User role' })
  readonly role: Role;
}
