import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  loginDemoAccount,
  changePassword,
  updateAvatar,
  deactivateAccount,
  forgotPassword,
  resetPassword,
  loginDemoAdmin
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo', loginDemoAccount);
router.post('/demo-admin', loginDemoAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/avatar', protect, updateAvatar);
router.put('/deactivate', protect, deactivateAccount);

export default router;