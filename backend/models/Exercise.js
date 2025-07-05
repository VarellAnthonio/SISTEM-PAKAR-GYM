// backend/models/Exercise.js - FIXED VERSION
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
        msg: 'Exercise name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Exercise name must be between 2 and 100 characters'
      }
    }
  },
  category: {
    type: DataTypes.ENUM('Push', 'Pull', 'Leg', 'Full Body', 'Cardio'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Exercise category is required'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sets: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '3×8-10'
  },
  duration: {
    type: DataTypes.STRING(20),
    allowNull: true // For cardio exercises
  },
  difficulty: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
    defaultValue: 'Beginner'
  },
  // YouTube integration fields
  youtubeUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'YouTube URL must be a valid URL'
      },
      isYouTubeUrl(value) {
        if (value && !value.includes('youtube.com') && !value.includes('youtu.be')) {
          throw new Error('URL must be a valid YouTube URL');
        }
      }
    }
  },
  youtubeVideoId: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  // Legacy fields (keeping for backward compatibility)
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Video URL must be a valid URL'
      }
    }
  },
  videoFileName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Image URL must be a valid URL'
      }
    }
  },
  imageFileName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // Exercise details
  muscleGroups: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  equipment: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  // Admin fields
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // SEO and metadata
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  // Exercise metrics (optional)
  caloriesBurned: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 1000
    }
  },
  // Created by admin tracking
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
      fields: ['difficulty']
    },
    {
      fields: ['is_active']
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
    }
  }
});

// Instance methods
Exercise.prototype.hasVideo = function() {
  return !!(this.youtubeUrl || this.videoUrl || this.videoFileName);
};

Exercise.prototype.hasYouTubeVideo = function() {
  return !!(this.youtubeUrl || this.youtubeVideoId);
};

Exercise.prototype.hasImage = function() {
  return !!(this.imageUrl || this.imageFileName);
};

Exercise.prototype.getVideoEmbedUrl = function() {
  if (this.youtubeVideoId) {
    return `https://www.youtube.com/embed/${this.youtubeVideoId}?controls=1&rel=0&modestbranding=1`;
  }
  return this.videoUrl || null;
};

Exercise.prototype.getVideoThumbnail = function() {
  if (this.youtubeVideoId) {
    return `https://img.youtube.com/vi/${this.youtubeVideoId}/hqdefault.jpg`;
  }
  return this.imageUrl || null;
};

Exercise.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return {
    ...values,
    hasVideo: this.hasVideo(),
    hasYouTubeVideo: this.hasYouTubeVideo(),
    hasImage: this.hasImage(),
    videoEmbedUrl: this.getVideoEmbedUrl(),
    videoThumbnail: this.getVideoThumbnail()
  };
};

// Static methods
Exercise.getCategoryColor = function(category) {
  const colors = {
    'Push': 'bg-red-100 text-red-800',
    'Pull': 'bg-blue-100 text-blue-800',
    'Leg': 'bg-green-100 text-green-800',
    'Full Body': 'bg-purple-100 text-purple-800',
    'Cardio': 'bg-orange-100 text-orange-800'
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
      [sequelize.Sequelize.Op.or]: [
        { youtubeUrl: { [sequelize.Sequelize.Op.ne]: null } },
        { videoUrl: { [sequelize.Sequelize.Op.ne]: null } }
      ],
      isActive: true
    },
    order: [['category', 'ASC'], ['name', 'ASC']]
  });
};

Exercise.getByDifficulty = async function(difficulty) {
  return await this.findAll({
    where: {
      difficulty,
      isActive: true
    },
    order: [['name', 'ASC']]
  });
};

// YouTube specific methods
Exercise.createWithYouTube = async function(exerciseData) {
  try {
    const { extractVideoId, validateYouTubeUrl } = await import('../utils/youtubeHelper.js');
    
    if (exerciseData.youtubeUrl) {
      if (!validateYouTubeUrl(exerciseData.youtubeUrl)) {
        throw new Error('Invalid YouTube URL');
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
      throw new Error('Exercise not found');
    }
    
    if (youtubeUrl && !validateYouTubeUrl(youtubeUrl)) {
      throw new Error('Invalid YouTube URL');
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

export default Exercise;