import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import User from './models/User.js';

// Load env vars
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Auto-seed admin function
const autoSeedAdmin = async () => {
  try {
    // Check if admin already exists
    let admin = await User.findOne({ 
      where: { email: 'admin@gymsporra.com' } 
    });

    if (!admin) {
      // Create new admin user
      admin = await User.create({
        name: 'Administrator',
        email: 'admin@gymsporra.com',
        password: 'admin123',
        gender: 'male',
        role: 'admin'
      });

      console.log('✅ Admin user created automatically');
      console.log('📧 Email: admin@gymsporra.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Gender: male');
      console.log('⚠️  Please change the password after first login!');
    } else {
      // Check if existing admin has gender field
      if (!admin.gender) {
        console.log('🔄 Updating existing admin with gender...');
        await admin.update({ gender: 'male' });
        console.log('✅ Admin gender updated');
      } else {
        console.log('✅ Admin user already exists');
      }
    }
  } catch (error) {
    console.error('❌ Error auto-seeding admin:', error.message);
    
    // If validation error, try to fix by recreating
    if (error.name === 'SequelizeValidationError') {
      console.log('🔄 Trying to recreate admin due to validation error...');
      try {
        // Delete existing admin if any
        await User.destroy({ where: { email: 'admin@gymsporra.com' } });
        
        // Create fresh admin
        const newAdmin = await User.create({
          name: 'Administrator',
          email: 'admin@gymsporra.com',
          password: 'admin123',
          gender: 'male',
          role: 'admin'
        });
        console.log('✅ Admin recreated successfully');
      } catch (recreateError) {
        console.error('❌ Failed to recreate admin:', recreateError.message);
      }
    }
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Sync database
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: true });
      console.log('📊 Database synced successfully (tables recreated)');
    } else {
      await sequelize.sync({ alter: true });
      console.log('📊 Database synced successfully');
    }
    
    // Auto-seed admin user
    await autoSeedAdmin();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();