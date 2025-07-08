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

// Consultation validators
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

// Program validators (EDIT ONLY - more restrictive)
export const updateProgramValidator = [
  // CONTENT-ONLY fields allowed
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Program name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  
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
    .isBoolean().withMessage('isActive must be a boolean'),

  // BLOCKED FIELDS validation
  body('code')
    .custom((value, { req }) => {
      if (value !== undefined) {
        throw new Error('Program code cannot be modified');
      }
      return true;
    }),
  
  body('bmiCategory')
    .custom((value, { req }) => {
      if (value !== undefined) {
        throw new Error('BMI category cannot be modified');
      }
      return true;
    }),
  
  body('bodyFatCategory')
    .custom((value, { req }) => {
      if (value !== undefined) {
        throw new Error('Body fat category cannot be modified');
      }
      return true;
    })
];

// Rule validators (ASSIGNMENT ONLY)
export const updateRuleValidator = [
  body('programId')
    .notEmpty().withMessage('Program ID is required')
    .isInt({ min: 1 }).withMessage('Program ID must be a valid integer'),
  
  // Block modification of other fields
  body('name')
    .custom((value, { req }) => {
      if (value !== undefined) {
        throw new Error('Rule name cannot be modified');
      }
      return true;
    }),
  
  body('bmiCategory')
    .custom((value, { req }) => {
      if (value !== undefined) {
        throw new Error('BMI category cannot be modified');
      }
      return true;
    }),
  
  body('bodyFatCategory')
    .custom((value, { req }) => {
      if (value !== undefined) {
        throw new Error('Body fat category cannot be modified');
      }
      return true;
    })
];

export const exerciseValidator = [
  body('name')
    .notEmpty().withMessage('Exercise name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Exercise name must be between 2 and 100 characters'),
  
  body('category')
    .notEmpty().withMessage('Exercise category is required')
    .isIn(['Angkat Beban', 'Kardio', 'Other']).withMessage('Invalid exercise category. Valid options: Angkat Beban, Kardio, Other'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  
  body('youtubeUrl')
    .optional()
    .custom((value) => {
      if (value && value.trim()) {
        // YouTube URL validation - SIMPLIFIED PATTERN
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        if (!youtubeRegex.test(value)) {
          throw new Error('Invalid YouTube URL format');
        }
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
];

export const updateExerciseValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Exercise name must be between 2 and 100 characters'),
  
  body('category')
    .optional()
    .isIn(['Angkat Beban', 'Kardio', 'Other']).withMessage('Invalid exercise category. Valid options: Angkat Beban, Kardio, Other'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  
  body('youtubeUrl')
    .optional()
    .custom((value) => {
      if (value && value.trim()) {
        // YouTube URL validation - SIMPLIFIED PATTERN
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        if (!youtubeRegex.test(value)) {
          throw new Error('Invalid YouTube URL format');
        }
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
];

// YouTube URL validator (standalone)
export const youtubeUrlValidator = [
  body('url')
    .notEmpty().withMessage('YouTube URL is required')
    .custom((value) => {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(value)) {
        throw new Error('Invalid YouTube URL format');
      }
      return true;
    })
];

export const exerciseSearchValidator = [
  body('query')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
  
  body('category')
    .optional()
    .isIn(['Angkat Beban', 'Kardio', 'Other']).withMessage('Invalid category'),
  
  body('hasVideo')
    .optional()
    .isBoolean().withMessage('hasVideo must be a boolean'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  body('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be at least 1')
];

// Forward chaining test validator
export const forwardChainingTestValidator = [
  body('weight')
    .notEmpty().withMessage('Weight is required')
    .isFloat({ min: 1, max: 500 }).withMessage('Weight must be between 1 and 500 kg'),
  
  body('height')
    .notEmpty().withMessage('Height is required')
    .isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300 cm'),
  
  body('bodyFatPercentage')
    .notEmpty().withMessage('Body fat percentage is required')
    .isFloat({ min: 1, max: 70 }).withMessage('Body fat percentage must be between 1 and 70%'),
  
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female']).withMessage('Gender must be either male or female')
];

// User preferences validators
export const favoriteValidator = [
  body('exerciseId')
    .notEmpty().withMessage('Exercise ID is required')
    .isInt({ min: 1 }).withMessage('Exercise ID must be a valid integer')
];

export const workoutLogValidator = [
  body('exerciseId')
    .notEmpty().withMessage('Exercise ID is required')
    .isInt({ min: 1 }).withMessage('Exercise ID must be a valid integer'),
  
  body('sets')
    .optional()
    .isInt({ min: 1 }).withMessage('Sets must be at least 1'),
  
  body('reps')
    .optional()
    .isInt({ min: 1 }).withMessage('Reps must be at least 1'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration must be at least 1 second'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters')
];

export const progressValidator = [
  body('exerciseId')
    .notEmpty().withMessage('Exercise ID is required')
    .isInt({ min: 1 }).withMessage('Exercise ID must be a valid integer'),
  
  body('personalRecord')
    .optional()
    .isObject().withMessage('Personal record must be an object'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters')
];

export const sanitizeYouTubeUrl = (url) => {
  if (!url) return null;
  
  // Extract video ID and create clean URL - SIMPLIFIED
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  
  return url;
};

export const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

export const validateYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

