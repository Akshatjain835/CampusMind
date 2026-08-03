import express from 'express';
import { generateAiNotice, createNotice, getNotices, deleteNotice } from '../controllers/noticeController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/generate-ai', protect, authorize('hod', 'admin', 'faculty'), generateAiNotice);
router.post('/', protect, authorize('hod', 'admin', 'faculty'), createNotice);
router.get('/', protect, getNotices);
router.delete('/:id', protect, authorize('hod', 'admin'), deleteNotice);

export default router;
