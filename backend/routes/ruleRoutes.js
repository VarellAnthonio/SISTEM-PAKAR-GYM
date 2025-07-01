import express from 'express';
import {
  getRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleStatus,
  getRuleStats,
  getMissingCombinations,
  testForwardChaining,
  bulkCreateRules
} from '../controllers/ruleController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ruleValidator, updateRuleValidator, validate } from '../utils/validators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Public routes (for users)
router.get('/', getRules);
router.get('/stats', authorize('admin'), getRuleStats);
router.get('/missing-combinations', authorize('admin'), getMissingCombinations);
router.get('/:id', getRuleById);

// Admin routes
router.post('/', authorize('admin'), ruleValidator, validate, createRule);
router.put('/:id', authorize('admin'), updateRuleValidator, validate, updateRule);
router.delete('/:id', authorize('admin'), deleteRule);
router.patch('/:id/toggle', authorize('admin'), toggleRuleStatus);

// Advanced admin routes
router.post('/bulk', authorize('admin'), bulkCreateRules);
router.post('/test-forward-chaining', authorize('admin'), testForwardChaining);

export default router;