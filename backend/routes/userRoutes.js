// backend/routes/userRoutes.js - SIMPLIFIED VERSION
import express from 'express';
import {
  getAllUsers,
  getUserById,
  deleteUser,
  toggleUserStatus,
  getUserStats
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

// SIMPLIFIED: User management routes (View, Toggle, Delete only)
router.route('/')
  .get(getAllUsers);

router.route('/stats')
  .get(getUserStats);

router.route('/:id')
  .get(getUserById)
  .delete(deleteUser);

// User status management only
router.patch('/:id/toggle', toggleUserStatus);

export default router;