import express from 'express';
import { registerUser, loginUser, getMe, updateProfile, seedUsers } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/seed', seedUsers);

export default router;
