import express from 'express';
import { registerUser, loginUser, getMe, seedUsers } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/seed', seedUsers);

export default router;
