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
