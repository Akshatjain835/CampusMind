import express from 'express';
import { getChatHistory, processAiQuery } from '../controllers/aiController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/chat-history', protect, getChatHistory);
router.post('/query', protect, processAiQuery);

export default router;
