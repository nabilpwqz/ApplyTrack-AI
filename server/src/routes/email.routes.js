import express from 'express';
import { syncRecruiterEmails, getUnprocessedEvents, processEmailImport } from '../controllers/email.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/sync', syncRecruiterEmails);
router.get('/events', getUnprocessedEvents);
router.post('/events/:eventId/process', processEmailImport);

export default router;
