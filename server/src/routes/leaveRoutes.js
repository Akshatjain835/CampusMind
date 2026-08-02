import express from 'express';
import { applyLeave, getMyLeaves, getPendingLeaves, getLeaveHistory, reviewLeave } from '../controllers/leaveController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/pending', protect, authorize('faculty', 'hod', 'admin'), getPendingLeaves);
router.get('/history', protect, authorize('faculty', 'hod', 'admin'), getLeaveHistory);
router.put('/:id/review', protect, authorize('faculty', 'hod', 'admin'), reviewLeave);

export default router;
