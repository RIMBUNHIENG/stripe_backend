import express from 'express';
import { register, login, logout } from '../../../controllers/auth/authControllers.js';
import { verifyOTP } from '../../../controllers/auth/verifyOTP.js';
import { resetPassword } from '../../../controllers/auth/resetPassword.js';
import { protect } from '../../../middleware/auth/auth.js';

const router = express.Router();

// register
router.post('/register', register)

// login
router.post('/login', login)

// logout
router.post('/logout', logout)

// verify otp (login)
router.post('/verify-otp', verifyOTP)

// reset password
router.post('/reset-password', protect, resetPassword )

export default router;