import {
  createUnionType,
  Field,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { User } from 'src/user/models';
import { Status } from './Game.model';

export enum GameSubscriptions {
  PLAYING_GAME = 'playingGame',
}

export enum GameEvent {
  USERJOINGAME = 'USERJOINGAME',
  USERVOTE = 'USERVOTE',
  USERLEFTGAME = 'USERLEFTGAME',
  USERSDELETED = 'USERSDELETED',
  STATUSCHANGED = 'STATUSCHANGED',
  GAMENAMECHANGED = 'GAMENAMECHANGED',
  REVEALVOTES = 'REVEALVOTES',
  RESETVOTES = 'RESETVOTES',
}

registerEnumType(GameSubscriptions, {
  name: 'GameSubscriptions',
  description: 'Game subscriptions',
});

registerEnumType(GameEvent, {
  name: 'GameEvents',
  description: 'Game events',
});

@ObjectType()
export class GameSubscriptionResponse {
  @Field(() => [GameSubscriptionEvent])
  events: GameSubscriptionEvent[];

  constructor(events: GameSubscriptionEvent[]) {
    this.events = events;
  }
}

@ObjectType()
export class GameSubscriptionEvent {
  @Field(() => GameEvent)
  eventType: GameEvent;
}

@ObjectType()
export class JoinGameEvent extends GameSubscriptionEvent {
  @Field(() => User)
  payload: User;
}

@ObjectType()
export class GameVoteEvent extends GameSubscriptionEvent {
  @Field(() => ID, { description: 'Id of the player who just voted' })
  payload: string;
}

@ObjectType()
export class LeftGameEvent extends GameSubscriptionEvent {
  @Field(() => ID)
  payload: string;
}

@ObjectType()
export class DeleteUsersEvent extends GameSubscriptionEvent {
  @Field(() => [ID], { description: 'List of deleted user ids' })
  payload: string[];
}

@ObjectType()
export class GameStatusEvent extends GameSubscriptionEvent {
  @Field(() => Status, {
    description: 'Game status: WAITING, IN_PROGRESS, FINISHED',
  })
  payload: Status;
}

@ObjectType()
export class GameChangeNameEvent extends GameSubscriptionEvent {
  @Field(() => String)
  payload: string;
}

@ObjectType()
export class UserVotePayload {
  @Field(() => ID)
  userId: string;

  @Field(() => String)
  vote: string;
}

@ObjectType()
export class GameRevealVoteEvent extends GameSubscriptionEvent {
  @Field(() => [UserVotePayload])
  payload: UserVotePayload[];
}

@ObjectType()
export class GameResetEvent extends GameSubscriptionEvent {
  @Field(() => String, { nullable: true })
  payload: null;
}

export const GameEventResponse = createUnionType({
  name: 'GameEventResponse',
  types: () =>
    [
      JoinGameEvent,
      GameVoteEvent,
      LeftGameEvent,
      DeleteUsersEvent,
      GameStatusEvent,
      GameChangeNameEvent,
      GameRevealVoteEvent,
      GameResetEvent,
    ] as const,
  resolveType: (value: GameSubscriptionEvent) => {
    switch (value.eventType) {
      case GameEvent.USERJOINGAME:
        return JoinGameEvent;
      case GameEvent.USERVOTE:
        return GameVoteEvent;
      case GameEvent.USERLEFTGAME:
        return LeftGameEvent;
      case GameEvent.USERSDELETED:
        return DeleteUsersEvent;
      case GameEvent.STATUSCHANGED:
        return GameStatusEvent;
      case GameEvent.GAMENAMECHANGED:
        return GameChangeNameEvent;
      case GameEvent.REVEALVOTES:
        return GameRevealVoteEvent;
      case GameEvent.RESETVOTES:
        return GameResetEvent;
    }
  },
});
