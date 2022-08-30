import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { GameModule } from '@game/game.module';
import { AppController } from './app.controller';
import { gqlConfiguration, configModuleOptions } from './configurations';
import { RedisModule } from '@redis-cache/redis.module';
import { AuthModule } from '@auth/auth.module';
import { LoggerMiddleware } from '@common/middlewares/logging.middleware';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>(gqlConfiguration()),
    ConfigModule.forRoot(configModuleOptions()),
    GameModule,
    RedisModule,
    AuthModule,
  ],
  providers: [AppResolver, AppService],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
