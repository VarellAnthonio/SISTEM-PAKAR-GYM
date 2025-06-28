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
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
    }
  ]
});

// Instance methods
Exercise.prototype.hasVideo = function() {
  return !!(this.videoUrl || this.videoFileName);
};

Exercise.prototype.hasImage = function() {
  return !!(this.imageUrl || this.imageFileName);
};

Exercise.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return {
    ...values,
    hasVideo: this.hasVideo(),
    hasImage: this.hasImage()
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

export default Exercise;