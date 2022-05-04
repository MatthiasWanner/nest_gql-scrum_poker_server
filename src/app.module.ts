import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { AppController } from './app.controller';
import configuration from './configuration';
import { RedisModule } from './redis-cache/redis.module';
import { AuthModule } from './auth/auth.module';
import { validate } from './env.validation';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      debug: true,
      playground: true,
      autoSchemaFile: true,
      context: async ({ extra, req, res }) => ({
        extra,
        req,
        res,
      }),
      subscriptions: {
        'graphql-ws': true,
      },
      cors: {
        credentials: true,
        origin: configuration().corsOrigin,
      },
      formatError: (error) => {
        return {
          message: error.message,
          path: error.path,
          extensions: {
            code: error.extensions.code,
          },
        };
      },
    }),
    ConfigModule.forRoot({
      validate,
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    GameModule,
    RedisModule,
    AuthModule,
  ],
  providers: [AppResolver, AppService],
  controllers: [AppController],
})
export class AppModule {}
