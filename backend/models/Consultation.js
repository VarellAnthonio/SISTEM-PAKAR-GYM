import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Consultation = sequelize.define('Consultation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  programId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'program_id'
  },
  ruleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'rule_id'
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Weight must be at least 1 kg'
      },
      max: {
        args: [500],
        msg: 'Weight must be less than 500 kg'
      }
    }
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: {
        args: [50],
        msg: 'Height must be at least 50 cm'
      },
      max: {
        args: [300],
        msg: 'Height must be less than 300 cm'
      }
    }
  },
  bodyFatPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Body fat percentage must be at least 1%'
      },
      max: {
        args: [70],
        msg: 'Body fat percentage must be less than 70%'
      }
    }
  },
  bmi: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  bmiCategory: {
    type: DataTypes.ENUM('B1', 'B2', 'B3', 'B4'),
    allowNull: false
  },
  bodyFatCategory: {
    type: DataTypes.ENUM('L1', 'L2', 'L3'),
    allowNull: false
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if fallback to default program'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active'
  }
}, {
  tableName: 'consultations',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['program_id']
    },
    {
      fields: ['rule_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['bmi_category', 'body_fat_category']
    }
  ]
});

// Instance methods
Consultation.prototype.calculateBMI = function() {
  const heightInMeters = this.height / 100;
  return this.weight / (heightInMeters * heightInMeters);
};

Consultation.prototype.getBMIDisplay = function() {
  const mapping = {
    'B1': 'Underweight',
    'B2': 'Ideal',
    'B3': 'Overweight',
    'B4': 'Obese'
  };
  return mapping[this.bmiCategory] || 'Unknown';
};

Consultation.prototype.getBodyFatDisplay = function() {
  const mapping = {
    'L1': 'Rendah',
    'L2': 'Normal',
    'L3': 'Tinggi'
  };
  return mapping[this.bodyFatCategory] || 'Unknown';
};

Consultation.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return {
    ...values,
    bmiDisplay: this.getBMIDisplay(),
    bodyFatDisplay: this.getBodyFatDisplay()
  };
};

export default Consultation;