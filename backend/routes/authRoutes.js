import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidator, loginValidator, validate } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;