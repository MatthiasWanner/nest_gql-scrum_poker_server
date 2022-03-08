import { ArgsType, Field } from '@nestjs/graphql';
import { CreatePartyInput } from './CreatePartyInput.models';

@ArgsType()
export class CreatePartyArgs {
  @Field(() => CreatePartyInput, { description: 'Create party input' })
  readonly input!: CreatePartyInput;
}
