import express from 'express';
import {
  getRules,
  getRuleById,
  updateRule,
  getRuleStats,
  getMissingCombinations
} from '../controllers/ruleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Public routes (for users and admins)
router.get('/', getRules);
router.get('/stats', authorize('admin'), getRuleStats);
router.get('/missing-combinations', authorize('admin'), getMissingCombinations);
router.get('/:id', getRuleById);

// Admin routes - ONLY UPDATE allowed (program assignment only)
router.put('/:id', authorize('admin'), updateRule);

// REMOVED ROUTES (no longer supported):
// - POST /api/rules (create new rule)
// - DELETE /api/rules/:id (delete rule)
// - PATCH /api/rules/:id/toggle (toggle status)
// - POST /api/rules/bulk (bulk create)
// - POST /api/rules/test-forward-chaining (test FC)

export default router;