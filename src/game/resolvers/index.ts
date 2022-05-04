import { GameQueriesResolver } from './game-queries.resolver';
import { GameMutationsResolver } from './game-mutations.resolver';
import { GameSubscriptionsResolver } from './game-subscriptions.resolver';

export default [
  GameQueriesResolver,
  GameMutationsResolver,
  GameSubscriptionsResolver,
];
