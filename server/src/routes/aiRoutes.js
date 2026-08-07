import express from 'express';
import { getChatHistory, clearChatHistory, processAiQuery, streamAiQuery } from '../controllers/aiController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/chat-history', protect, getChatHistory);
router.delete('/chat-history', protect, clearChatHistory);
router.post('/query', protect, processAiQuery);
router.post('/stream-query', protect, streamAiQuery);

export default router;
