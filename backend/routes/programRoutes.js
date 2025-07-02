import express from 'express';
import {
  getPrograms,
  getProgramById,
  updateProgram,
  getProgramStats
} from '../controllers/programController.js';
import { protect, authorize } from '../middleware/auth.js';
import { updateProgramValidator, validate } from '../utils/validators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// READ-ONLY routes (for users and admins)
router.get('/', getPrograms);
router.get('/stats', authorize('admin'), getProgramStats);
router.get('/id/:id', getProgramById);

// EDIT-ONLY route (admin only) - NO CREATE, NO DELETE
router.put('/:id', authorize('admin'), updateProgramValidator, validate, updateProgram);

export default router;