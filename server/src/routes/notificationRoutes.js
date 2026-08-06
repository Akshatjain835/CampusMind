import express from 'express';
import { getNotifications, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications);

router.route('/read-all')
  .put(protect, markAllAsRead);

export default router;
