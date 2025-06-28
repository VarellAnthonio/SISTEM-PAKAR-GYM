import express from 'express';
import {
  createConsultation,
  getUserConsultations,
  getConsultation,
  updateConsultation,
  deleteConsultation,
  getAllConsultations,
  getConsultationStats
} from '../controllers/consultationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { consultationValidator, updateConsultationValidator, validate } from '../utils/validators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.route('/')
  .get(getUserConsultations)
  .post(consultationValidator, validate, createConsultation);

router.route('/:id')
  .get(getConsultation)
  .put(updateConsultationValidator, validate, updateConsultation)
  .delete(deleteConsultation);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllConsultations);
router.get('/admin/stats', authorize('admin'), getConsultationStats);

export default router;