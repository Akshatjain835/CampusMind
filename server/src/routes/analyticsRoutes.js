import express from 'express';
import { getDepartmentKpis, getAiAnalyticsSummary } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/kpi', protect, getDepartmentKpis);
router.post('/ai-summary', protect, authorize('hod', 'admin', 'faculty'), getAiAnalyticsSummary);

export default router;
