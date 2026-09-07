import { Router } from 'express';
import {
  getAllUsers,
  getSystemStats,
  toggleUserStatus,
  deleteUser,
  updateUserRole
} from '../controllers/admin.controller';
import { protect, isAdmin } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.get('/stats', getSystemStats);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;