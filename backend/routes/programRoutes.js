import express from 'express';
import {
  getPrograms,
  getProgramByCode,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramStats
} from '../controllers/programController.js';
import { protect, authorize } from '../middleware/auth.js';
import { programValidator, updateProgramValidator, validate } from '../utils/validators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Public routes (for users)
router.get('/', getPrograms);
router.get('/stats', authorize('admin'), getProgramStats);
router.get('/id/:id', getProgramById);
router.get('/:code', getProgramByCode);

// Admin routes
router.post('/', authorize('admin'), programValidator, validate, createProgram);
router.put('/:id', authorize('admin'), updateProgramValidator, validate, updateProgram);
router.delete('/:id', authorize('admin'), deleteProgram);

export default router;