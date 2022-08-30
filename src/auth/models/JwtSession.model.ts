import { Field, ObjectType } from '@nestjs/graphql';
import { UserInSession } from '@user/models';

@ObjectType()
export class JwtSession extends UserInSession {
  @Field(() => Number, { description: 'Token signature timestamp' })
  iat: number;

  @Field(() => Number, { description: 'Expiration timestamp' })
  exp: number;
}
