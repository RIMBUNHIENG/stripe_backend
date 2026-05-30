import express from 'express';
import { register, login, logout, profile } from '../../../controllers/auth/authControllers.js';
import { verifyOTP } from '../../../controllers/auth/verifyOTP.js';
import { resetPassword } from '../../../controllers/auth/resetPassword.js';
import { protect } from '../../../middleware/auth/auth.js';
import { forgotPassword } from '../../../controllers/auth/Forgot Password/forgotPassword.js';
import { setNewPassword } from '../../../controllers/auth/Forgot Password/setNewPassword.js';
import { verifyForgotOTP } from '../../../controllers/auth/Forgot Password/verifyForgotOtp.js';

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

// forgot password
router.post('/forgot-password', forgotPassword)
router.post('/verify-forgot-otp', verifyForgotOTP)
router.post('/set-new-password', setNewPassword)

// who user profile
router.get('/profile', protect, profile)


export default router;