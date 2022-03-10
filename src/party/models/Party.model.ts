import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Party {
  @Field(() => String, { description: 'Id of existing party' })
  partyId: string;

  @Field(() => String, { description: 'Name of the new party' })
  partyName: string;

  @Field(() => [User], { description: 'Users in the party' })
  users: User[];
}

@ObjectType()
export class NewParty extends Party {
  @Field(() => String, { description: 'Redis response status' })
  redisResponse: string;
}

/**
 * User model
 * @description Temporaly model to type the user
 * @description This model wil be replaced by real entity
 */
@ObjectType()
export class User {
  @Field(() => String, { description: 'Id of existing user' })
  userId: string;

  @Field(() => String, { description: 'Name of the player' })
  username: string;

  @Field(() => Int, { nullable: true, description: 'Current vote' })
  vote: number | null;
}
