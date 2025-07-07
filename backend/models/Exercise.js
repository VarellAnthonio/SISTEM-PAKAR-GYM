// backend/models/Exercise.js - SIMPLIFIED VERSION
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Exercise = sequelize.define('Exercise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nama gerakan harus diisi'
      },
      len: {
        args: [2, 100],
        msg: 'Nama gerakan harus antara 2-100 karakter'
      }
    }
  },
  // SIMPLIFIED CATEGORIES - Only 3 instead of 5
  category: {
    type: DataTypes.ENUM('Angkat Beban', 'Kardio', 'Other'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Kategori gerakan harus dipilih'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // YouTube integration fields - KEPT
  youtubeUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'URL YouTube harus berupa URL yang valid'
      },
      isYouTubeUrl(value) {
        if (value && !value.includes('youtube.com') && !value.includes('youtu.be')) {
          throw new Error('URL harus berupa URL YouTube yang valid');
        }
      }
    }
  },
  youtubeVideoId: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  // Admin fields - KEPT
  // Admin fields - FIXED with explicit defaults
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,  // FIXED: Don't allow null
    defaultValue: true,  // FIXED: Explicit default
    validate: {
      notNull: {
        msg: 'isActive field is required'
      }
    }
  },
  // Created by admin tracking - KEPT
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'exercises',
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['is_active']  // FIXED: Index for better performance
    },
    {
      fields: ['name']
    },
    {
      fields: ['youtube_video_id']
    },
    {
      fields: ['created_by']
    }
  ],
  hooks: {
    beforeCreate: async (exercise) => {
      // FIXED: Ensure isActive has a value
      if (exercise.isActive === undefined || exercise.isActive === null) {
        exercise.isActive = true;
      }
      
      // Extract YouTube video ID if URL is provided
      if (exercise.youtubeUrl && !exercise.youtubeVideoId) {
        try {
          const { extractVideoId } = await import('../utils/youtubeHelper.js');
          const videoId = extractVideoId(exercise.youtubeUrl);
          if (videoId) {
            exercise.youtubeVideoId = videoId;
          }
        } catch (error) {
          console.warn('Error extracting YouTube video ID:', error.message);
        }
      }
    },
    beforeUpdate: async (exercise) => {
      // Update YouTube video ID if URL changed
      if (exercise.changed('youtubeUrl') && exercise.youtubeUrl) {
        try {
          const { extractVideoId } = await import('../utils/youtubeHelper.js');
          const videoId = extractVideoId(exercise.youtubeUrl);
          if (videoId) {
            exercise.youtubeVideoId = videoId;
          }
        } catch (error) {
          console.warn('Error extracting YouTube video ID:', error.message);
        }
      } else if (exercise.changed('youtubeUrl') && !exercise.youtubeUrl) {
        exercise.youtubeVideoId = null;
      }
    },
    beforeValidate: (exercise) => {
      // FIXED: Ensure isActive is boolean
      if (exercise.isActive === undefined || exercise.isActive === null) {
        exercise.isActive = true;
      }
      
      // Convert string boolean to actual boolean
      if (typeof exercise.isActive === 'string') {
        exercise.isActive = exercise.isActive === 'true';
      }
    }
  }
});

// Instance methods - SIMPLIFIED
Exercise.prototype.hasVideo = function() {
  return !!(this.youtubeUrl);
};

Exercise.prototype.hasYouTubeVideo = function() {
  return !!(this.youtubeUrl || this.youtubeVideoId);
};

Exercise.prototype.getVideoEmbedUrl = function() {
  if (this.youtubeVideoId) {
    return `https://www.youtube.com/embed/${this.youtubeVideoId}?controls=1&rel=0&modestbranding=1`;
  }
  return null;
};

Exercise.prototype.getVideoThumbnail = function() {
  if (this.youtubeVideoId) {
    return `https://img.youtube.com/vi/${this.youtubeVideoId}/hqdefault.jpg`;
  }
  return null;
};

Exercise.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return {
    ...values,
    hasVideo: this.hasVideo(),
    hasYouTubeVideo: this.hasYouTubeVideo(),
    videoEmbedUrl: this.getVideoEmbedUrl(),
    videoThumbnail: this.getVideoThumbnail()
  };
};

// Static methods - UPDATED FOR 3 CATEGORIES
Exercise.getCategoryColor = function(category) {
  const colors = {
    'Angkat Beban': 'bg-blue-100 text-blue-800',
    'Kardio': 'bg-red-100 text-red-800',
    'Other': 'bg-green-100 text-green-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

Exercise.findByCategory = async function(category) {
  return await this.findAll({
    where: {
      category,
      isActive: true
    },
    order: [['name', 'ASC']]
  });
};

Exercise.searchByName = async function(searchTerm) {
  return await this.findAll({
    where: {
      name: {
        [sequelize.Sequelize.Op.iLike]: `%${searchTerm}%`
      },
      isActive: true
    },
    order: [['name', 'ASC']]
  });
};

Exercise.getWithVideo = async function() {
  return await this.findAll({
    where: {
      youtubeUrl: { [sequelize.Sequelize.Op.ne]: null },
      isActive: true
    },
    order: [['category', 'ASC'], ['name', 'ASC']]
  });
};

// YouTube specific methods
Exercise.createWithYouTube = async function(exerciseData) {
  try {
    const { extractVideoId, validateYouTubeUrl } = await import('../utils/youtubeHelper.js');
    
    if (exerciseData.youtubeUrl) {
      if (!validateYouTubeUrl(exerciseData.youtubeUrl)) {
        throw new Error('URL YouTube tidak valid');
      }
      const videoId = extractVideoId(exerciseData.youtubeUrl);
      if (videoId) {
        exerciseData.youtubeVideoId = videoId;
      }
    }
    
    return await this.create(exerciseData);
  } catch (error) {
    console.error('Error creating exercise with YouTube:', error);
    throw error;
  }
};

Exercise.updateYouTubeUrl = async function(id, youtubeUrl) {
  try {
    const { extractVideoId, validateYouTubeUrl } = await import('../utils/youtubeHelper.js');
    
    const exercise = await this.findByPk(id);
    if (!exercise) {
      throw new Error('Gerakan tidak ditemukan');
    }
    
    if (youtubeUrl && !validateYouTubeUrl(youtubeUrl)) {
      throw new Error('URL YouTube tidak valid');
    }
    
    const updateData = {
      youtubeUrl,
      youtubeVideoId: youtubeUrl ? extractVideoId(youtubeUrl) : null
    };
    
    return await exercise.update(updateData);
  } catch (error) {
    console.error('Error updating YouTube URL:', error);
    throw error;
  }
};

// SIMPLIFIED CATEGORY METHODS - Only 3 categories
Exercise.getAvailableCategories = function() {
  return ['Angkat Beban', 'Kardio', 'Other'];
};

Exercise.getCategoryStats = async function() {
  const categories = this.getAvailableCategories();
  const stats = {};
  
  for (const category of categories) {
    const total = await this.count({
      where: { category }
    });
    const active = await this.count({
      where: { category, isActive: true }
    });
    const withVideo = await this.count({
      where: { 
        category, 
        isActive: true,
        youtubeUrl: { [sequelize.Sequelize.Op.ne]: null }
      }
    });
    
    stats[category] = {
      total,
      active,
      inactive: total - active,
      withVideo,
      withoutVideo: active - withVideo,
      videoPercentage: active > 0 ? Math.round((withVideo / active) * 100) : 0
    };
  }
  
  return stats;
};

export default Exercise;