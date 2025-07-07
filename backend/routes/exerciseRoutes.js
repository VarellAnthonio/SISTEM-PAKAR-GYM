// backend/routes/exerciseRoutes.js - FIXED VERSION
import express from 'express';
import {
  getExercises,
  getExercisesByCategory,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  toggleExerciseStatus,
  updateExerciseStatus,  // NEW: Direct status update
  getExerciseStats,
  getCategories
} from '../controllers/exerciseController.js';
import { protect, authorize } from '../middleware/auth.js';
import { exerciseValidator, updateExerciseValidator, validate } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', getExercises);
router.get('/categories', getCategories);
router.get('/category/:category', getExercisesByCategory);
router.get('/:id', getExercise);

// Protected routes (Admin only)
router.use(protect);

// Admin statistics
router.get('/admin/stats', authorize('admin'), getExerciseStats);

// Admin CRUD operations
router.post('/', authorize('admin'), exerciseValidator, validate, createExercise);
router.put('/:id', authorize('admin'), updateExerciseValidator, validate, updateExercise);
router.delete('/:id', authorize('admin'), deleteExercise);

// FIXED: Status management routes
router.patch('/:id/toggle', authorize('admin'), toggleExerciseStatus);  // Toggle current status
router.patch('/:id/status', authorize('admin'), updateExerciseStatus);  // Set specific status

export default router;