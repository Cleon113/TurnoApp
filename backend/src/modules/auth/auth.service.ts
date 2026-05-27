import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database';
import { JwtPayload, UserRole } from '../../shared/types';

const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as string,
  } as jwt.SignOptions);
};

const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string,
  } as jwt.SignOptions);
};

interface RegisterParams {
  orgName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    orgId: number;
  };
}

export const registerService = async (params: RegisterParams): Promise<AuthResult> => {
  const { orgName, firstName, lastName, email, password } = params;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Step 1: Check if email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Step 2: Create the organization
    const orgResult = await client.query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING id',
      [orgName]
    );
    const orgId: number = orgResult.rows[0].id;

    // Step 3: Hash the password
    // 12 rounds = strong security. Each extra round doubles the hashing time.
    // 12 is the industry standard balance between security and performance.
    const passwordHash = await bcrypt.hash(password, 12);

    // Step 4: Create the admin user
    const userResult = await client.query(
      `INSERT INTO users (org_id, email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, first_name, last_name, org_id`,
      [orgId, email, passwordHash, 'admin', firstName, lastName]
    );
    const user = userResult.rows[0];

    // Step 5: Generate tokens
    const jwtPayload: JwtPayload = {
      userId: user.id,
      orgId: user.org_id,
      role: user.role,
    };
    const accessToken  = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Step 6: Store refresh token in DB
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    await client.query('COMMIT');

    return {
      accessToken,
      refreshToken,
      user: {
        id:        user.id,
        email:     user.email,
        role:      user.role,
        firstName: user.first_name,
        lastName:  user.last_name,
        orgId:     user.org_id,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginService = async (
  email: string,
  password: string
): Promise<AuthResult> => {

  // Step 1: Find user by email
  const result = await pool.query(
    `SELECT id, org_id, email, password_hash, role, first_name, last_name, is_active
     FROM users WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];

  // Same error message for "user not found" and "wrong password"
  // — never tell attackers which one it is
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  if (!user.is_active) {
    throw new Error('ACCOUNT_DISABLED');
  }

  // Step 2: Compare password with hash
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Step 3: Generate tokens
  const jwtPayload: JwtPayload = {
    userId: user.id,
    orgId:  user.org_id,
    role:   user.role,
  };
  const accessToken  = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  // Step 4: Store refresh token
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [user.id, refreshToken]
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id:        user.id,
      email:     user.email,
      role:      user.role,
      firstName: user.first_name,
      lastName:  user.last_name,
      orgId:     user.org_id,
    },
  };
};

// ── Refresh token ─────────────────────────────────────────────────────────────

export const refreshTokenService = async (
  token: string
): Promise<{ accessToken: string }> => {

  // Step 1: Check token exists in DB and is not expired
  const result = await pool.query(
    `SELECT rt.id, rt.user_id, rt.expires_at,
            u.role, u.org_id, u.is_active
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token = $1`,
    [token]
  );

  const row = result.rows[0];
  if (!row) throw new Error('INVALID_REFRESH_TOKEN');
  if (!row.is_active) throw new Error('ACCOUNT_DISABLED');
  if (new Date(row.expires_at) < new Date()) {
    throw new Error('REFRESH_TOKEN_EXPIRED');
  }

  // Step 2: Verify JWT signature
  const payload = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET as string
  ) as JwtPayload;

  // Step 3: Issue new access token
  const accessToken = generateAccessToken({
    userId: payload.userId,
    orgId:  payload.orgId,
    role:   payload.role,
  });

  return { accessToken };
};

// ── Logout ────────────────────────────────────────────────────────────────────

export const logoutService = async (token: string): Promise<void> => {
  // Delete the refresh token from DB — it can never be used again
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};