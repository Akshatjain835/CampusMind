import express from 'express';
import { 
  scheduleAiMeeting, createMeeting, getMeetings, 
  rescheduleMeeting, cancelMeeting 
} from '../controllers/meetingController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/schedule-ai', protect, authorize('hod', 'admin', 'faculty'), scheduleAiMeeting);
router.post('/', protect, authorize('hod', 'admin', 'faculty'), createMeeting);
router.get('/', protect, getMeetings);
router.put('/:id/reschedule', protect, authorize('hod', 'admin', 'faculty'), rescheduleMeeting);
router.delete('/:id', protect, authorize('hod', 'admin', 'faculty'), cancelMeeting);

export default router;
