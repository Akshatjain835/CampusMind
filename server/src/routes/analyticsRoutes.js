import express from 'express';
import { getDepartmentKpis, getAiAnalyticsSummary, getFacultyWorkloadDetails } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/kpi', protect, getDepartmentKpis);
router.get('/faculty-workload', protect, getFacultyWorkloadDetails);
router.post('/ai-summary', protect, getAiAnalyticsSummary);

export default router;
