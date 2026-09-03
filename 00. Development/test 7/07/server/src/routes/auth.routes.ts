import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  loginDemoAccount
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo', loginDemoAccount);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
