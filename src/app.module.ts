import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { AppController } from './app.controller';
import configuration from './configuration';
import { pubsub } from './pubsub';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      debug: true,
      playground: true,
      autoSchemaFile: true,
      context: async ({ connection, req, res }) => {
        if (connection) {
          return {
            ...connection.context,
            pubsub,
            req,
            res,
          };
        } else {
          return { pubsub, req, res };
        }
      },
      subscriptions: {
        'graphql-ws': true,
      },
      cors: {
        credentials: true,
        origin: configuration().corsOrigin,
      },
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      load: [configuration],
    }),
    GameModule,
    RedisCacheModule,
    AuthModule,
  ],
  providers: [AppResolver, AppService],
  controllers: [AppController],
})
export class AppModule {}
