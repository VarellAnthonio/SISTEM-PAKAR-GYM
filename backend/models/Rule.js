import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Rule = sequelize.define('Rule', {
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
        msg: 'Rule name is required'
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
  programId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'program_id'  // Map to snake_case column name
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: 'Priority must be at least 1'
      }
    }
  },
  conditions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional conditions for forward chaining'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'rules',
  indexes: [
    {
      unique: true,
      fields: ['bmi_category', 'body_fat_category'],
      where: {
        is_active: true
      }
    },
    {
      fields: ['program_id']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Instance methods
Rule.prototype.getCondition = function() {
  return `${this.bmiCategory}-${this.bodyFatCategory}`;
};

Rule.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

export default Rule;