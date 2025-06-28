import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Program = sequelize.define('Program', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: {
      msg: 'Program code already exists'
    },
    validate: {
      notEmpty: {
        msg: 'Program code is required'
      },
      len: {
        args: [2, 10],
        msg: 'Program code must be between 2 and 10 characters'
      }
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Program name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Program name must be between 2 and 100 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bmiCategory: {
    type: DataTypes.ENUM('B1', 'B2', 'B3', 'B4'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'BMI category is required'
      }
    }
  },
  bodyFatCategory: {
    type: DataTypes.ENUM('L1', 'L2', 'L3'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Body fat category is required'
      }
    }
  },
  cardioRatio: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '50% Kardio - 50% Beban'
  },
  dietRecommendation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  schedule: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    validate: {
      isValidSchedule(value) {
        const requiredDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        const providedDays = Object.keys(value);
        
        const missingDays = requiredDays.filter(day => !providedDays.includes(day));
        if (missingDays.length > 0) {
          throw new Error(`Missing schedule for days: ${missingDays.join(', ')}`);
        }
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'programs',
  indexes: [
    {
      unique: true,
      fields: ['bmi_category', 'body_fat_category']
    },
    {
      fields: ['code']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Instance methods
Program.prototype.getCondition = function() {
  return `${this.bmiCategory}-${this.bodyFatCategory}`;
};

Program.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

// Static methods
Program.getBMICategoryDisplay = function(category) {
  const mapping = {
    'B1': 'Underweight',
    'B2': 'Ideal',
    'B3': 'Overweight',
    'B4': 'Obese'
  };
  return mapping[category] || 'Unknown';
};

Program.getBodyFatCategoryDisplay = function(category) {
  const mapping = {
    'L1': 'Rendah',
    'L2': 'Normal',
    'L3': 'Tinggi'
  };
  return mapping[category] || 'Unknown';
};

Program.findByCondition = async function(bmiCategory, bodyFatCategory) {
  return await this.findOne({
    where: {
      bmiCategory,
      bodyFatCategory,
      isActive: true
    }
  });
};

export default Program;