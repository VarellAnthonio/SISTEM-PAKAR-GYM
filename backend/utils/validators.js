import { body, validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Auth validators
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female']).withMessage('Gender must be either male or female'),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Invalid role')
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Consultation validators (Notes field removed)
export const consultationValidator = [
  body('weight')
    .notEmpty().withMessage('Weight is required')
    .isFloat({ min: 1, max: 500 }).withMessage('Weight must be between 1 and 500 kg'),
  body('height')
    .notEmpty().withMessage('Height is required')
    .isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300 cm'),
  body('bodyFatPercentage')
    .notEmpty().withMessage('Body fat percentage is required')
    .isFloat({ min: 1, max: 70 }).withMessage('Body fat percentage must be between 1 and 70%')
];

export const updateConsultationValidator = [
  body('status')
    .optional()
    .isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters')
];

// Program validators
export const programValidator = [
  body('code')
    .notEmpty().withMessage('Program code is required')
    .isLength({ min: 2, max: 10 }).withMessage('Program code must be between 2 and 10 characters')
    .matches(/^[A-Z0-9]+$/).withMessage('Program code must contain only uppercase letters and numbers'),
  body('name')
    .notEmpty().withMessage('Program name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Program name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('bmiCategory')
    .notEmpty().withMessage('BMI category is required')
    .isIn(['B1', 'B2', 'B3', 'B4']).withMessage('Invalid BMI category'),
  body('bodyFatCategory')
    .notEmpty().withMessage('Body fat category is required')
    .isIn(['L1', 'L2', 'L3']).withMessage('Invalid body fat category'),
  body('cardioRatio')
    .optional()
    .isLength({ max: 50 }).withMessage('Cardio ratio must not exceed 50 characters'),
  body('dietRecommendation')
    .optional()
    .isLength({ max: 1000 }).withMessage('Diet recommendation must not exceed 1000 characters'),
  body('schedule')
    .notEmpty().withMessage('Schedule is required')
    .isObject().withMessage('Schedule must be an object')
    .custom((value) => {
      const requiredDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      const providedDays = Object.keys(value);
      const missingDays = requiredDays.filter(day => !providedDays.includes(day));
      if (missingDays.length > 0) {
        throw new Error(`Missing schedule for days: ${missingDays.join(', ')}`);
      }
      return true;
    })
];

export const updateProgramValidator = [
  body('code')
    .optional()
    .isLength({ min: 2, max: 10 }).withMessage('Program code must be between 2 and 10 characters')
    .matches(/^[A-Z0-9]+$/).withMessage('Program code must contain only uppercase letters and numbers'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Program name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('bmiCategory')
    .optional()
    .isIn(['B1', 'B2', 'B3', 'B4']).withMessage('Invalid BMI category'),
  body('bodyFatCategory')
    .optional()
    .isIn(['L1', 'L2', 'L3']).withMessage('Invalid body fat category'),
  body('cardioRatio')
    .optional()
    .isLength({ max: 50 }).withMessage('Cardio ratio must not exceed 50 characters'),
  body('dietRecommendation')
    .optional()
    .isLength({ max: 1000 }).withMessage('Diet recommendation must not exceed 1000 characters'),
  body('schedule')
    .optional()
    .isObject().withMessage('Schedule must be an object')
    .custom((value) => {
      if (value) {
        const requiredDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        const providedDays = Object.keys(value);
        const missingDays = requiredDays.filter(day => !providedDays.includes(day));
        if (missingDays.length > 0) {
          throw new Error(`Missing schedule for days: ${missingDays.join(', ')}`);
        }
      }
      return true;
    }),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
];

// Exercise validators (for future use)
export const exerciseValidator = [
  body('name')
    .notEmpty().withMessage('Exercise name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Exercise name must be between 2 and 100 characters'),
  body('category')
    .notEmpty().withMessage('Exercise category is required')
    .isIn(['Push', 'Pull', 'Leg', 'Full Body', 'Cardio']).withMessage('Invalid exercise category'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('instructions')
    .optional()
    .isLength({ max: 2000 }).withMessage('Instructions must not exceed 2000 characters'),
  body('sets')
    .optional()
    .isLength({ max: 20 }).withMessage('Sets must not exceed 20 characters'),
  body('duration')
    .optional()
    .isLength({ max: 20 }).withMessage('Duration must not exceed 20 characters'),
  body('difficulty')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty level'),
  body('muscleGroups')
    .optional()
    .isArray().withMessage('Muscle groups must be an array'),
  body('equipment')
    .optional()
    .isArray().withMessage('Equipment must be an array')
];

export const updateExerciseValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Exercise name must be between 2 and 100 characters'),
  body('category')
    .optional()
    .isIn(['Push', 'Pull', 'Leg', 'Full Body', 'Cardio']).withMessage('Invalid exercise category'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('instructions')
    .optional()
    .isLength({ max: 2000 }).withMessage('Instructions must not exceed 2000 characters'),
  body('sets')
    .optional()
    .isLength({ max: 20 }).withMessage('Sets must not exceed 20 characters'),
  body('duration')
    .optional()
    .isLength({ max: 20 }).withMessage('Duration must not exceed 20 characters'),
  body('difficulty')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty level'),
  body('muscleGroups')
    .optional()
    .isArray().withMessage('Muscle groups must be an array'),
  body('equipment')
    .optional()
    .isArray().withMessage('Equipment must be an array'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
];