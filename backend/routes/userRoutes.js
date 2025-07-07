// backend/routes/userRoutes.js
import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  resetUserPassword,
  changeUserRole
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { updateUserValidator, resetPasswordValidator, validate } from '../utils/validators.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.route('/')
  .get(getAllUsers);

router.route('/stats')
  .get(getUserStats);

router.route('/:id')
  .get(getUserById)
  .put(updateUserValidator, validate, updateUser)
  .delete(deleteUser);

// User status management
router.patch('/:id/toggle', toggleUserStatus);
router.patch('/:id/role', changeUserRole);

// Password management
router.post('/:id/reset-password', resetPasswordValidator, validate, resetUserPassword);

export default router;