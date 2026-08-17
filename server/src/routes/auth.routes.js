import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, loginDemoAccount } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo', loginDemoAccount);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
