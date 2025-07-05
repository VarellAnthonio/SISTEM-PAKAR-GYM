// frontend/src/services/exercise.js
import { apiService } from './api';

export const exerciseService = {
  // Get all exercises with filtering and pagination
  getAll: async (params = {}) => {
    try {
      const response = await apiService.exercises.getAll(params);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get exercises';
      return {
        success: false,
        message
      };
    }
  },

  // Get exercises by category
  getByCategory: async (category) => {
    try {
      const response = await apiService.exercises.getByCategory(category);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get exercises by category';
      return {
        success: false,
        message
      };
    }
  },

  // Get single exercise
  getById: async (id) => {
    try {
      const response = await apiService.exercises.getById(id);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get exercise';
      return {
        success: false,
        message
      };
    }
  },

  // Get available categories
  getCategories: async () => {
    try {
      const response = await apiService.exercises.getCategories();
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get categories';
      return {
        success: false,
        message
      };
    }
  },

  // Search exercises
  search: async (searchTerm, filters = {}) => {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      const response = await apiService.exercises.getAll(params);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search exercises';
      return {
        success: false,
        message
      };
    }
  },

  // Admin methods
  admin: {
    // Get exercise statistics
    getStats: async () => {
      try {
        const response = await apiService.exercises.getStats();
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to get exercise statistics';
        return {
          success: false,
          message
        };
      }
    },

    // Create new exercise
    create: async (exerciseData) => {
      try {
        const response = await apiService.exercises.create(exerciseData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to create exercise';
        const errors = error.response?.data?.errors || [];
        return {
          success: false,
          message,
          errors
        };
      }
    },

    // Update exercise
    update: async (id, exerciseData) => {
      try {
        const response = await apiService.exercises.update(id, exerciseData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update exercise';
        const errors = error.response?.data?.errors || [];
        return {
          success: false,
          message,
          errors
        };
      }
    },

    // Delete exercise
    delete: async (id) => {
      try {
        const response = await apiService.exercises.delete(id);
        return {
          success: true,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete exercise';
        return {
          success: false,
          message
        };
      }
    },

    // Toggle exercise status
    toggleStatus: async (id) => {
      try {
        const response = await apiService.exercises.toggleStatus(id);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to toggle exercise status';
        return {
          success: false,
          message
        };
      }
    }
  },

  // Utility methods
  utils: {
    // Get category display color
    getCategoryColor: (category) => {
      const colors = {
        'Push': 'bg-red-100 text-red-800',
        'Pull': 'bg-blue-100 text-blue-800',
        'Leg': 'bg-green-100 text-green-800',
        'Full Body': 'bg-purple-100 text-purple-800',
        'Cardio': 'bg-orange-100 text-orange-800'
      };
      return colors[category] || 'bg-gray-100 text-gray-800';
    },

    // Get difficulty display color
    getDifficultyColor: (difficulty) => {
      const colors = {
        'Beginner': 'bg-green-100 text-green-800',
        'Intermediate': 'bg-yellow-100 text-yellow-800',
        'Advanced': 'bg-red-100 text-red-800'
      };
      return colors[difficulty] || 'bg-gray-100 text-gray-800';
    },

    // Extract YouTube video ID from URL
    extractYouTubeId: (url) => {
      if (!url) return null;
      
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      
      return null;
    },

    // Generate YouTube embed URL
    generateEmbedUrl: (videoId, options = {}) => {
      if (!videoId) return null;
      
      const defaultOptions = {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1
      };
      
      const embedOptions = { ...defaultOptions, ...options };
      const params = new URLSearchParams(embedOptions);
      
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    },

    // Generate YouTube thumbnail URL
    generateThumbnailUrl: (videoId, quality = 'hqdefault') => {
      if (!videoId) return null;
      return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
    },

    // Validate YouTube URL
    validateYouTubeUrl: (url) => {
      if (!url) return false;
      return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url);
    },

    // Process exercise data for display
    processExerciseData: (exercise) => {
      if (!exercise) return null;
      
      const videoId = exercise.youtubeVideoId || this.extractYouTubeId(exercise.youtubeUrl);
      
      return {
        ...exercise,
        videoId,
        embedUrl: videoId ? this.generateEmbedUrl(videoId) : null,
        thumbnailUrl: videoId ? this.generateThumbnailUrl(videoId) : null,
        hasVideo: !!(exercise.youtubeUrl || exercise.videoUrl),
        categoryColor: this.getCategoryColor(exercise.category),
        difficultyColor: this.getDifficultyColor(exercise.difficulty)
      };
    },

    // Filter exercises by multiple criteria
    filterExercises: (exercises, filters) => {
      return exercises.filter(exercise => {
        // Category filter
        if (filters.category && exercise.category !== filters.category) {
          return false;
        }
        
        // Difficulty filter
        if (filters.difficulty && exercise.difficulty !== filters.difficulty) {
          return false;
        }
        
        // Search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const searchFields = [
            exercise.name,
            exercise.description,
            exercise.muscleGroups?.join(' '),
            exercise.equipment?.join(' ')
          ].join(' ').toLowerCase();
          
          if (!searchFields.includes(searchTerm)) {
            return false;
          }
        }
        
        // Has video filter
        if (filters.hasVideo !== undefined) {
          const hasVideo = !!(exercise.youtubeUrl || exercise.videoUrl);
          if (filters.hasVideo !== hasVideo) {
            return false;
          }
        }
        
        return true;
      });
    },

    // Sort exercises by different criteria
    sortExercises: (exercises, sortBy = 'name', order = 'asc') => {
      return [...exercises].sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
          case 'name':
            valueA = a.name?.toLowerCase() || '';
            valueB = b.name?.toLowerCase() || '';
            break;
          case 'category':
            valueA = a.category || '';
            valueB = b.category || '';
            break;
          case 'difficulty':
            const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
            valueA = difficultyOrder[a.difficulty] || 0;
            valueB = difficultyOrder[b.difficulty] || 0;
            break;
          case 'createdAt':
            valueA = new Date(a.createdAt || 0);
            valueB = new Date(b.createdAt || 0);
            break;
          default:
            valueA = a[sortBy] || '';
            valueB = b[sortBy] || '';
        }
        
        if (order === 'desc') {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        } else {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        }
      });
    },

    // Get exercise statistics from array
    getExerciseStats: (exercises) => {
      const stats = {
        total: exercises.length,
        withVideo: 0,
        withoutVideo: 0,
        byCategory: {},
        byDifficulty: {}
      };
      
      exercises.forEach(exercise => {
        // Video stats
        if (exercise.youtubeUrl || exercise.videoUrl) {
          stats.withVideo++;
        } else {
          stats.withoutVideo++;
        }
        
        // Category stats
        const category = exercise.category || 'Unknown';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        
        // Difficulty stats
        const difficulty = exercise.difficulty || 'Unknown';
        stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
      });
      
      return stats;
    },

    // Validate exercise form data
    validateExerciseData: (data) => {
      const errors = [];
      
      if (!data.name || data.name.trim().length < 2) {
        errors.push('Exercise name must be at least 2 characters');
      }
      
      if (!data.category) {
        errors.push('Category is required');
      }
      
      if (data.youtubeUrl && !this.validateYouTubeUrl(data.youtubeUrl)) {
        errors.push('Invalid YouTube URL format');
      }
      
      if (data.muscleGroups && !Array.isArray(data.muscleGroups)) {
        errors.push('Muscle groups must be an array');
      }
      
      if (data.equipment && !Array.isArray(data.equipment)) {
        errors.push('Equipment must be an array');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  }
};