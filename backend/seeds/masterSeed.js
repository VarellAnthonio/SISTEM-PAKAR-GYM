import dotenv from 'dotenv';
import sequelize, { testConnection } from '../config/database.js';
import { User, Program, Exercise, Rule, Consultation } from '../models/index.js';

dotenv.config();

const masterSeed = async () => {
  try {
    console.log('🚀 Starting master database seeding...\n');

    // Test database connection
    console.log('🔌 Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Sync database with force (this will drop and recreate all tables)
    console.log('🗄️  Syncing database (this will recreate all tables)...');
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully\n');

    // Create admin user (password will be auto-hashed by User model hooks)
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@gymsporra.com',
      password: 'admin123',  // This will be hashed automatically
      gender: 'male',
      role: 'admin'
    });
    console.log('✅ Admin user created');

    // Create sample users (passwords will be auto-hashed)
    console.log('👥 Creating sample users...');
    const sampleUsers = await User.bulkCreate([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',  // This will be hashed automatically
        gender: 'male',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',  // This will be hashed automatically
        gender: 'female',
        role: 'user'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'password123',  // This will be hashed automatically
        gender: 'male',
        role: 'user'
      },
      {
        name: 'Alice Brown',
        email: 'alice@example.com',
        password: 'password123',  // This will be hashed automatically
        gender: 'female',
        role: 'user'
      }
    ], {
      individualHooks: true  // IMPORTANT: This ensures beforeCreate hooks run for each user
    });
    console.log(`✅ Created ${sampleUsers.length} sample users\n`);

    // Create programs
    console.log('🏋️ Creating programs...');
    const programsData = [
      {
        code: 'P1',
        name: 'Fat Loss Program',
        description: 'Program untuk menurunkan lemak tubuh dengan kombinasi kardio dan beban',
        bmiCategory: 'B1',
        bodyFatCategory: 'L1',
        cardioRatio: '10% Kardio - 90% Beban',
        dietRecommendation: 'Fokus pada surplus kalori 300-500 kalori dengan makanan kaya protein dan karbohidrat untuk meningkatkan berat badan dan massa otot.',
        schedule: {
          'Senin': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
          'Selasa': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
          'Rabu': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
          'Kamis': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
          'Jumat': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
          'Sabtu': '1. Squats: 3×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Standing Calf Raises: 3×6-8\n6. Seated Calf Raises: 2×10-15',
          'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
        }
      },
      {
        code: 'P2',
        name: 'Muscle Gain Program',
        description: 'Program untuk menambah massa otot dengan fokus latihan beban',
        bmiCategory: 'B2',
        bodyFatCategory: 'L2',
        cardioRatio: '40% Kardio - 60% Beban',
        dietRecommendation: 'Menjaga berat badan ideal dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.',
        schedule: {
          'Senin': '1. Squats: 3×6-8\n2. Bench Press: 3×6-8\n3. Seated Cable Rows: 3×8-10\n4. Dumbbell Shoulder Press: 3×8-10\n5. Lat Pull-Downs: 3×8-10\n6. Leg Curls: 3×8-10\n7. Triceps Pushdowns: 3×10-15\n8. Biceps Curls: 3×10-15',
          'Selasa': '1. Romanian Deadlift: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×6-8\n3. Incline Dumbbell Press: 3×8-10\n4. Chest Supported Rows: 3×8-10\n5. Leg Press: 3×10-12\n6. Lateral Raises: 3×10-15\n7. Face Pulls: 3×10-15\n8. Standing Calf Raises: 4×6-10',
          'Rabu': 'Cardio (Treadmill/Sepeda Statis)',
          'Kamis': '1. Squats: 3×6-8\n2. Bench Press: 3×6-8\n3. Seated Cable Rows: 3×8-10\n4. Dumbbell Shoulder Press: 3×8-10\n5. Lat Pull-Downs: 3×8-10\n6. Leg Curls: 3×8-10\n7. Triceps Pushdowns: 3×10-15\n8. Biceps Curls: 3×10-15',
          'Jumat': '1. Romanian Deadlift: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×6-8\n3. Incline Dumbbell Press: 3×8-10\n4. Chest Supported Rows: 3×8-10\n5. Leg Press: 3×10-12\n6. Lateral Raises: 3×10-15\n7. Face Pulls: 3×10-15\n8. Standing Calf Raises: 4×6-10',
          'Sabtu': 'Cardio (Treadmill/Sepeda Statis)',
          'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
        }
      },
      {
        code: 'P3',
        name: 'Weight Loss Program',
        description: 'Program untuk menurunkan berat badan dengan fokus kardio',
        bmiCategory: 'B3',
        bodyFatCategory: 'L3',
        cardioRatio: '70% Kardio - 30% Beban',
        dietRecommendation: 'Menurunkan berat badan dengan defisit kalori 300-500 kalori melalui konsumsi protein tinggi dan pengurangan karbohidrat sederhana.',
        schedule: {
          'Senin': '1. Bench Press: 3×6-8\n2. Rows: 3×6-8\n3. Shoulder Press: 3×8-10\n4. Pull-Ups: 3×8-10\n5. Incline Dumbbell Flyes: 2×10-15\n6. Dumbbell Curls: 2×12-15\n7. Triceps Extensions: 2×12-15',
          'Selasa': 'Cardio (Treadmill/Sepeda Statis)',
          'Rabu': '1. Squats: 3×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Standing Calf Raises: 4×6-8',
          'Kamis': 'Cardio (Treadmill/Sepeda Statis)',
          'Jumat': '1. Bench Press: 3×6-8\n2. Rows: 3×6-8\n3. Shoulder Press: 3×8-10\n4. Pull-Ups: 3×8-10\n5. Incline Dumbbell Flyes: 2×10-15\n6. Dumbbell Curls: 2×12-15\n7. Triceps Extensions: 2×12-15',
          'Sabtu': 'Cardio (Treadmill/Sepeda Statis)',
          'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
        }
      }
    ];

    const programs = await Program.bulkCreate(programsData);
    console.log(`✅ Created ${programs.length} programs`);

    // Create rules
    console.log('📏 Creating rules...');
    const rulesData = programs.map((program, index) => ({
      name: `Rule for ${program.name}`,
      description: `IF BMI = ${program.bmiCategory} AND Body Fat = ${program.bodyFatCategory} THEN Program = ${program.code}`,
      bmiCategory: program.bmiCategory,
      bodyFatCategory: program.bodyFatCategory,
      programId: program.id,
      priority: index + 1,
      isActive: true
    }));

    const rules = await Rule.bulkCreate(rulesData);
    console.log(`✅ Created ${rules.length} rules`);

    // Create some exercises
    console.log('💪 Creating exercises...');
    const exercisesData = [
      {
        name: 'Bench Press',
        category: 'Push',
        description: 'Upper body compound exercise targeting chest, shoulders, and triceps',
        sets: '3×6-8',
        difficulty: 'Intermediate',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
        equipment: ['Barbell', 'Bench']
      },
      {
        name: 'Squats',
        category: 'Leg',
        description: 'Lower body compound exercise targeting quadriceps, glutes, and hamstrings',
        sets: '3×6-8',
        difficulty: 'Intermediate',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
        equipment: ['Barbell', 'Squat Rack']
      },
      {
        name: 'Pull-Ups',
        category: 'Pull',
        description: 'Upper body compound exercise targeting lats, rhomboids, and biceps',
        sets: '3×8-10',
        difficulty: 'Advanced',
        muscleGroups: ['Lats', 'Rhomboids', 'Biceps'],
        equipment: ['Pull-up Bar']
      },
      {
        name: 'Treadmill Running',
        category: 'Cardio',
        description: 'Cardiovascular exercise using treadmill',
        duration: '20-30 minutes',
        difficulty: 'Beginner',
        muscleGroups: ['Legs', 'Cardiovascular System'],
        equipment: ['Treadmill']
      }
    ];

    const exercises = await Exercise.bulkCreate(exercisesData);
    console.log(`✅ Created ${exercises.length} exercises`);

    // Create sample consultation
    console.log('📋 Creating sample consultation...');
    const consultation = await Consultation.createWithForwardChaining({
      userId: sampleUsers[0].id,
      weight: 70.5,
      height: 175.0,
      bodyFatPercentage: 15.0,
      notes: 'Wants to build muscle mass'
    });
    console.log('✅ Created sample consultation');

    // Display summary
    console.log('\n📊 SEEDING SUMMARY');
    console.log('==================');
    console.log(`👤 Users: ${await User.count()}`);
    console.log(`🏋️ Programs: ${await Program.count()}`);
    console.log(`📏 Rules: ${await Rule.count()}`);
    console.log(`💪 Exercises: ${await Exercise.count()}`);
    console.log(`📋 Consultations: ${await Consultation.count()}`);

    console.log('\n🎉 Master seeding completed successfully!');
    console.log('\n🔑 LOGIN CREDENTIALS');
    console.log('====================');
    console.log('Admin: admin@gymsporra.com / admin123');
    console.log('Users: john@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Master seeding failed:', error);
    process.exit(1);
  }
};

masterSeed();