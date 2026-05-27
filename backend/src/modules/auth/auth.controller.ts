import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
} from './auth.service';

// ── Register ──────────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  // Check if validators found any errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.type, message: e.msg })),
    });
    return;
  }

  try {
    const result = await registerService(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.type, message: e.msg })),
    });
    return;
  }

  try {
    const { email, password } = req.body;
    const result = await loginService(email, password);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }
    if (error.message === 'ACCOUNT_DISABLED') {
      res.status(403).json({
        success: false,
        message: 'Account is disabled',
      });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ── Refresh token ─────────────────────────────────────────────────────────────

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
    return;
  }

  try {
    const result = await refreshTokenService(token);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (
      error.message === 'INVALID_REFRESH_TOKEN' ||
      error.message === 'REFRESH_TOKEN_EXPIRED'
    ) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
    return;
  }

  try {
    await logoutService(token);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};