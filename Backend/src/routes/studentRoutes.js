import { Router } from 'express';
import {
  getProfile,
  getUnreadCount,
} from '../controllers/studentCotroller.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.get('/profile',      getProfile);
router.get('/unread-count', getUnreadCount);

export default router;