import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './config/database.js';

// Import all models to ensure they are loaded
import { User, Program, Exercise, Rule, Consultation } from './models/index.js';
import { Op } from 'sequelize';

// Import routes
import authRoutes from './routes/authRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import programRoutes from './routes/programRoutes.js';

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
app.use('/api/consultations', consultationRoutes);
app.use('/api/programs', programRoutes);

// Health check route with database info
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Get basic stats
    const stats = {
      users: await User.count(),
      programs: await Program.count(),
      exercises: await Exercise.count(),
      rules: await Rule.count(),
      consultations: await Consultation.count()
    };

    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    name: 'Sistem Pakar Program Olahraga API',
    version: '1.0.0',
    description: 'Expert system for fitness program recommendations using forward chaining',
    endpoints: {
      auth: '/api/auth/*',
      consultations: '/api/consultations/*',
      programs: '/api/programs/*',
      health: '/api/health',
      info: '/api'
    },
    models: ['User', 'Program', 'Exercise', 'Rule', 'Consultation'],
    features: [
      'JWT Authentication',
      'Role-based Access Control', 
      'Forward Chaining Algorithm',
      'BMI & Body Fat Analysis',
      'Program Recommendations',
      'Consultation Management',
      'Program CRUD Operations'
    ]
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
    message: 'Route not found',
    availableEndpoints: [
      'GET /api',
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/auth/logout',
      'GET /api/consultations',
      'POST /api/consultations',
      'GET /api/consultations/:id',
      'GET /api/programs',
      'GET /api/programs/:code'
    ]
  });
});

// Auto-seed admin function (updated)
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
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error auto-seeding admin:', error.message);
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
      // In development, force recreate tables to fix any schema issues
      await sequelize.sync({ force: false }); // Changed back to false to preserve data
      console.log('📊 Database synced successfully');
    } else {
      await sequelize.sync({ alter: true });
      console.log('📊 Database synced successfully');
    }
    
    // Auto-seed admin user
    await autoSeedAdmin();

    // Get current stats
    const stats = {
      users: await User.count(),
      programs: await Program.count(),
      exercises: await Exercise.count(),
      rules: await Rule.count(),
      consultations: await Consultation.count()
    };

    console.log('📊 Current database stats:', stats);
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('🎯 Available API Endpoints:');
      console.log('  📝 Authentication: /api/auth/*');
      console.log('  🏋️ Consultations: /api/consultations/*');
      console.log('  📋 Programs: /api/programs/*');
      console.log('  📊 Health Check: /api/health');
      console.log('');
      
      if (stats.programs === 0) {
        console.log('⚠️  No programs found in database!');
        console.log('💡 Run seeding to populate with sample data:');
        console.log('   npm run seed');
      } else {
        console.log('✅ Database ready with seeded data');
        console.log('🔑 Admin Login: admin@gymsporra.com / admin123');
        console.log('👤 Sample User: john@example.com / password123');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();