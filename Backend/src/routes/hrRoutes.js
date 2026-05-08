import { Router } from 'express';
import {
  notifyAll,
  notifySelected,
  getHistory,
  getAllStudents,
  getAllUsers,
  createUser,
} from '../controllers/hrController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('hr'));

router.post('/notify-all',      notifyAll);
router.post('/notify-selected', notifySelected);
router.get('/history',          getHistory);
router.get('/students',         getAllStudents);
router.get('/users',            getAllUsers);
router.post('/users',           createUser);

export default router;
