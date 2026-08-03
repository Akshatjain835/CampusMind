import express from 'express';
import { generateAiTimetable, saveTimetable, getTimetable, deleteTimetable } from '../controllers/timetableController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/generate-ai', protect, authorize('hod', 'admin', 'faculty'), generateAiTimetable);
router.post('/', protect, authorize('hod', 'admin', 'faculty'), saveTimetable);
router.get('/', protect, getTimetable);
router.delete('/', protect, authorize('hod', 'admin'), deleteTimetable);

export default router;
