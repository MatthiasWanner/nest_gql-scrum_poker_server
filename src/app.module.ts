import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { PartyModule } from './party/party.module';
import { AppController } from './app.controller';
import configuration from './configuration';
import { pubsub } from './pubsub';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      debug: true,
      playground: true,
      autoSchemaFile: true,
      context: async ({ connection }) => {
        if (connection) {
          return {
            ...connection.context,
            pubsub,
          };
        } else {
          return { pubsub };
        }
      },
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      load: [configuration],
    }),
    PartyModule,
  ],
  providers: [AppResolver, AppService],
  controllers: [AppController],
})
export class AppModule {}
