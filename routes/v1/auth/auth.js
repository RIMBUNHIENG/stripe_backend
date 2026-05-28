import express from 'express';
import { register, login } from '../../../controllers/auth/authControllers.js';

const router = express.Router();

// register
router.post('/register', register)

router.post('/login', login)

export default router;