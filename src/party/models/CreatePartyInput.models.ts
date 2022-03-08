import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePartyInput {
  @Field(() => String, { description: 'Message text' })
  message: string;
}
