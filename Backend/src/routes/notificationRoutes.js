import { Router } from 'express';
import {
  getAllNotifications,
  getPriorityNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.get('/',           getAllNotifications);
router.get('/priority',   getPriorityNotifications);
router.patch('/read-all', markAllAsRead);
router.get('/:id',        getNotificationById);
router.patch('/:id/read', markAsRead);

export default router;