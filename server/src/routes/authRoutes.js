import { Router } from 'express';
import { body } from 'express-validator';
import { login, me, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.post('/register', [body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Name must be 1–80 characters'), body('email').isEmail().normalizeEmail().withMessage('Enter a valid email'), body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be at least 8 characters')], validate, register);
router.post('/login', [body('email').isEmail().normalizeEmail().withMessage('Enter a valid email'), body('password').notEmpty().withMessage('Password is required')], validate, login);
router.get('/me', requireAuth, me);
export default router;
