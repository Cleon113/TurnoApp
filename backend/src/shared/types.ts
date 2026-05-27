export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: number;
  org_id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  created_at: Date;
}

export interface JwtPayload {
  userId: number;
  orgId: number;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}