import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Game {
  @Field(() => String, { description: 'Id of existing game' })
  gameId: string;

  @Field(() => String, { description: 'Name of the new game' })
  gameName: string;

  @Field(() => [UserInGame], { description: 'Users in the game' })
  users: UserInGame[];
}

@ObjectType()
export class NewGame {
  @Field(() => Game, { description: 'Current game' })
  game: Game;

  @Field(() => String, { description: 'Redis response status' })
  redisResponse: string;

  @Field(() => String, { description: 'Jwt session token' })
  accessToken: string;
}

@ObjectType()
export class UserJoinGame extends NewGame {}

/**
 * User model
 * @description Temporaly model to type the user
 * @description This model wil be replaced by real entity
 */
@ObjectType()
export class UserInGame {
  @Field(() => String, { description: 'Id of existing user' })
  userId: string;

  @Field(() => String, { description: 'Name of the player' })
  username: string;

  @Field(() => String, {
    description: 'Role of the player during current game',
  })
  role: Role;

  @Field(() => Int, { nullable: true, description: 'Current vote' })
  vote: number | null;
}

export enum Role {
  SCRUMMASTER = 'SCRUMMASTER',
  DEVELOPER = 'DEVELOPER',
}
