import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => String, { description: 'Id of existing user' })
  userId: string;

  @Field(() => String, { description: 'Name of the player' })
  username: string;

  @Field(() => UserRole, {
    description: 'Role of the player during current game',
  })
  role: UserRole;
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

export enum UserRole {
  DEVELOPER = 'DEVELOPER',
  SCRUMMASTER = 'SCRUMMASTER',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});
