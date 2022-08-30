declare module 'ioredis';

declare namespace Express {
  export interface Request {
    user?: UserSession;
  }
}

interface UserSession {
  userId: string;
  gameId: string;
  username: string;
  role: Role;
}

interface ScrumAppConfig {
  port: number;
  redisHost: string;
  redisPort: number;
  cookiesConfig: {
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
  };
  corsOrigin: string;
}
