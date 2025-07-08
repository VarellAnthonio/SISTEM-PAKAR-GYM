// backend/controllers/userController.js - SIMPLIFIED VERSION (View, Toggle, Delete Only)
import { User, Consultation } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    // Search filter
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    // Role filter
    if (role && role !== 'all') {
      whereClause.role = role;
    }

    // Status filter
    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    const result = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Consultation,
          as: 'consultations',
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'programId', 'bmi', 'bodyFatPercentage', 'createdAt', 'status']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

// REMOVED: updateUser function - Admin tidak bisa edit user info

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id  
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ENHANCED: Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // ENHANCED: Prevent deleting admin accounts for security
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete administrator accounts for security reasons'
      });
    }

    // Check if user has consultations
    const consultationCount = await Consultation.count({ 
      where: { userId: id } 
    });

    if (consultationCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with ${consultationCount} consultation(s). User has existing data in the system.`
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// @desc    Toggle user status (Admin only)
// @route   PATCH /api/users/:id/toggle
// @access  Private (Admin)
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ENHANCED: Prevent admin from deactivating themselves
    if (user.id === req.user.id && user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // ENHANCED: Additional protection for admin accounts
    if (user.role === 'admin' && user.id !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify other administrator accounts'
      });
    }

    const newStatus = !user.isActive;
    await user.update({ isActive: newStatus });

    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user.id,
        name: user.name,
        isActive: newStatus
      }
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private (Admin)
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const regularUsers = await User.count({ where: { role: 'user' } });

    // Users by gender
    const maleUsers = await User.count({ where: { gender: 'male', isActive: true } });
    const femaleUsers = await User.count({ where: { gender: 'female', isActive: true } });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Users with consultations
    const usersWithConsultations = await User.count({
      include: [{
        model: Consultation,
        as: 'consultations',
        required: true
      }]
    });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        admins: adminUsers,
        users: regularUsers,
        male: maleUsers,
        female: femaleUsers,
        recentRegistrations,
        usersWithConsultations,
        registrationRate: totalUsers > 0 ? Math.round((recentRegistrations / totalUsers) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
};

// REMOVED FUNCTIONS (no longer supported):
// ❌ updateUser() - Admin tidak bisa edit user info
// ❌ resetUserPassword() - Admin tidak bisa reset password  
// ❌ changeUserRole() - Admin tidak bisa ubah role