import { Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { Message } from './models/app.models';

@Resolver('App')
export class AppResolver {
  constructor(private appService: AppService) {}

  @Query(() => Message)
  async hello() {
    return this.appService.getHello();
  }
}
