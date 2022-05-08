import { ConfigModuleOptions } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { validate } from './env.validation';

export const appConfiguration = (): ScrumAppConfig => ({
  port: +process.env.PORT,
  redisHost: process.env.REDIS_HOST,
  redisPort: +process.env.REDIS_PORT,
  cookiesConfig: {
    maxAge: 3_600_000,
    httpOnly: true,
    secure: true,
  },
  corsOrigin: process.env.CORS_ORIGIN,
});

export const configModuleOptions = (): ConfigModuleOptions => ({
  validate,
  envFilePath: ['.env.local', '.env'],
  isGlobal: true,
  load: [appConfiguration],
  cache: true,
});

export const gqlConfiguration = (): ApolloDriverConfig => ({
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
    origin: appConfiguration().corsOrigin,
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
});
