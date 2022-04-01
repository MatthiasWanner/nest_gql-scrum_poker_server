import { Field, ObjectType } from '@nestjs/graphql';
import { UserInGame } from 'src/user/models/user.models';

@ObjectType()
export class Game {
  @Field(() => String, { description: 'Id of existing game' })
  gameId: string;

  @Field(() => String, { description: 'Name of the new game' })
  gameName: string;
}

@ObjectType()
export class CurrentGame extends Game {
  @Field(() => [UserInGame], { description: 'Users in the game' })
  users: UserInGame[];

  @Field(() => Boolean, {
    description: "Describe if all users's votes registred",
  })
  isShowable: boolean;
}

@ObjectType()
export class NewGame {
  @Field(() => CurrentGame, { description: 'Current game' })
  game: CurrentGame;

  @Field(() => String, { description: 'Redis response status' })
  redisResponse: string;

  @Field(() => String, { description: 'Jwt session token' })
  accessToken: string;
}

@ObjectType()
export class UserJoinGame extends NewGame {}
