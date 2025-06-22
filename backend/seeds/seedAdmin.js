import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    // Check if admin already exists
    const adminExists = await User.findOne({ 
      where: { email: 'admin@gymsporra.com' } 
    });

    if (adminExists) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@gymsporra.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@gymsporra.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();