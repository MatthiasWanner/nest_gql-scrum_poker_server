import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserRoles } from 'src/constants/user.constants';

@ObjectType()
export class User {
  @Field(() => String, { description: 'Id of existing user' })
  userId: string;

  @Field(() => String, { description: 'Name of the player' })
  username: string;

  @Field(() => String, {
    description: 'Role of the player during current game',
  })
  role: UserRoles;
}

@ObjectType()
export class UserInGame extends User {
  @Field(() => Int, { nullable: true, description: 'Current vote' })
  vote: number | null;

  @Field(() => Boolean, { description: 'Describe if the user had voted' })
  hasVoted: boolean;
}

@ObjectType()
export class UserInSession extends User {
  @Field(() => String, {
    nullable: false,
    description: 'The current session game id',
  })
  gameId: string;
}
