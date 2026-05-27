import { Router } from 'express';
import { register, login, refreshToken, logout } from './auth.controller';
import { registerValidator, loginValidator } from './auth.validators';

const router = Router();

// Each route: validator runs first, then controller
router.post('/register', registerValidator, register);
router.post('/login',    loginValidator,    login);
router.post('/refresh',  refreshToken);
router.post('/logout',   logout);

export default router;