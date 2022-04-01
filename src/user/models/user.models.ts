import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => String, { description: 'Id of existing user' })
  userId: string;

  @Field(() => String, { description: 'Name of the player' })
  username: string;

  @Field(() => String, {
    description: 'Role of the player during current game',
  })
  role: Role;
}

@ObjectType()
export class UserInGame extends User {
  @Field(() => Int, { nullable: true, description: 'Current vote' })
  vote: number | null;

  @Field(() => Boolean, { description: 'Describe if the user had voted' })
  hasVoted: boolean;
}

export enum Role {
  SCRUMMASTER = 'SCRUMMASTER',
  DEVELOPER = 'DEVELOPER',
}
