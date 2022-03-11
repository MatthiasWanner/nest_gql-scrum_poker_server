import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Party {
  @Field(() => String, { description: 'Id of existing party' })
  partyId: string;

  @Field(() => String, { description: 'Name of the new party' })
  partyName: string;

  @Field(() => [UserInParty], { description: 'Users in the party' })
  users: UserInParty[];
}

@ObjectType()
export class NewParty {
  @Field(() => Party, { description: 'Current party' })
  party: Party;

  @Field(() => String, { description: 'Redis response status' })
  redisResponse: string;

  @Field(() => String, { description: 'Jwt session token' })
  accessToken: string;
}

@ObjectType()
export class UserJoinParty extends NewParty {}

/**
 * User model
 * @description Temporaly model to type the user
 * @description This model wil be replaced by real entity
 */
@ObjectType()
export class UserInParty {
  @Field(() => String, { description: 'Id of existing user' })
  userId: string;

  @Field(() => String, { description: 'Name of the player' })
  username: string;

  @Field(() => String, {
    description: 'Role of the player during current party',
  })
  role: Role;

  @Field(() => Int, { nullable: true, description: 'Current vote' })
  vote: number | null;
}

export enum Role {
  SCRUMMASTER = 'SCRUMMASTER',
  DEVELOPER = 'DEVELOPER',
}
