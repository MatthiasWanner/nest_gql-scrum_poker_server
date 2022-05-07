import {
  Field,
  ID,
  Int,
  ObjectType,
  OmitType,
  registerEnumType,
} from '@nestjs/graphql';
import { User, UserInGame } from 'src/user/models/user.models';

@ObjectType()
export class Game {
  @Field(() => ID, { description: 'Id of existing game' })
  gameId: string;

  @Field(() => String, { description: 'Name of the new game' })
  gameName: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Number of max players allowed',
  })
  maxPlayers: number;
}

@ObjectType()
export class CurrentGame extends Game {
  @Field(() => [UserInGame], { description: 'Users in the game' })
  users: UserInGame[];

  @Field(() => Status, {
    description: "Game status 'WAITING', 'IN_PROGRESS' or 'FINISHED' ",
  })
  status: Status;

  @Field(() => [ID], { description: 'Array of deleted users IDs' })
  deletedUsers: string[];
}

@ObjectType()
export class NewGame {
  @Field(() => User, { description: 'New user subscribing' })
  user: User;

  @Field(() => CurrentGame, { description: 'Current game' })
  game: CurrentGame;

  @Field(() => String, { description: 'Redis response status' })
  redisResponse: string;

  @Field(() => String, { description: 'Jwt session token' })
  accessToken: string;
}

@ObjectType()
export class UserJoinGame extends NewGame {}

@ObjectType()
export class GameResponse extends OmitType(NewGame, ['accessToken']) {}

export enum Status {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

registerEnumType(Status, {
  name: 'Status',
  description: 'Game status',
});
