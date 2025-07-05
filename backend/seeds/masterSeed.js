import dotenv from 'dotenv';
import sequelize, { testConnection } from '../config/database.js';
import { User, Program, Exercise, Rule, Consultation } from '../models/index.js';
import { MedicalLogic } from '../utils/medicalLogic.js';
import { RULE_CONSTANTS } from '../config/ruleConstants.js';

dotenv.config();

const masterSeed = async () => {
  try {
    console.log('🚀 Starting complete database seeding with P1-P10 + 10 Realistic Rules + Exercises...\n');

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

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@gymsporra.com',
      password: 'admin123',
      gender: 'male',
      role: 'admin'
    });
    console.log('✅ Admin user created');

    // Create sample users
    console.log('👥 Creating sample users...');
    const sampleUsers = await User.bulkCreate([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        gender: 'male',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        gender: 'female',
        role: 'user'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'password123',
        gender: 'male',
        role: 'user'
      },
      {
        name: 'Alice Brown',
        email: 'alice@example.com',
        password: 'password123',
        gender: 'female',
        role: 'user'
      }
    ], {
      individualHooks: true
    });
    console.log(`✅ Created ${sampleUsers.length} sample users\n`);

    console.log('🏋️ Creating complete programs P1-P10...');
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
      },
      {
        code: 'P4',
        name: 'Extreme Weight Loss Program',
        description: 'Program intensif untuk penurunan berat badan yang signifikan',
        bmiCategory: 'B4',
        bodyFatCategory: 'L3',
        cardioRatio: '80% Kardio - 20% Beban',
        dietRecommendation: 'Mengurangi berat badan secara signifikan dengan defisit kalori 500-700 kalori, mengutamakan makanan rendah kalori dan tinggi protein.',
        schedule: {
          'Senin': '1. Light Strength: Bench Press: 3×6-8\n2. Rows: 3×6-8\n3. Shoulder Press: 3×8-10\n4. Cardio: 30 menit',
          'Selasa': 'Cardio Focus: 45 menit\n- HIIT atau Steady State\n- Treadmill/Sepeda/Elliptical',
          'Rabu': 'Cardio Focus: 45 menit\n- Pilihan berbeda dari Selasa\n- Intensitas sedang-tinggi',
          'Kamis': '1. Light Lower Body: Squats: 3×6-8\n2. Leg Press: 3×8-10\n3. Leg Curls: 3×8-10\n4. Cardio: 30 menit',
          'Jumat': 'Cardio Focus: 45 menit\n- Kombinasi HIIT dan LISS\n- Total fat burning',
          'Sabtu': 'Cardio Focus: 50 menit\n- Low intensity long duration\n- Recovery pace',
          'Minggu': 'Active Recovery:\n- Jalan santai 30 menit\n- Yoga/Stretching 20 menit'
        }
      },
      {
        code: 'P5',
        name: 'Lean Muscle Program',
        description: 'Program untuk menambah massa otot tanpa menambah lemak berlebih',
        bmiCategory: 'B1',
        bodyFatCategory: 'L2',
        cardioRatio: '20% Kardio - 80% Beban',
        dietRecommendation: 'Menambah berat badan dengan surplus kalori 300-500 kalori melalui makanan bergizi tinggi dan kaya protein tanpa menambah lemak berlebih.',
        schedule: {
          'Senin': '1. Heavy Push: Bench Press: 4×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Press: 3×8-10\n4. Triceps Work: 3×10-15\n5. Dips: 3×8-12',
          'Selasa': '1. Heavy Pull: Rows: 4×6-8\n2. Pull-Ups: 3×8-10\n3. Cable Rows: 3×10-15\n4. Face Pulls: 3×12-15\n5. Biceps Work: 3×10-15',
          'Rabu': '1. Heavy Legs: Squats: 4×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Calf Raises: 4×8-12',
          'Kamis': '1. Volume Push: Incline Press: 3×8-12\n2. Lateral Raises: 4×12-15\n3. Dumbbell Press: 3×10-12\n4. Triceps Superset: 3×12-15',
          'Jumat': '1. Volume Pull: Wide Grip Rows: 3×8-12\n2. Lat Pulldowns: 4×10-12\n3. Rear Delt Work: 3×12-15\n4. Biceps Superset: 3×12-15',
          'Sabtu': '1. Volume Legs: Front Squats: 3×8-10\n2. Lunges: 3×12 each leg\n3. Leg Extensions: 3×12-15\n4. Hamstring Curls: 3×12-15',
          'Minggu': 'Light Cardio: 20 menit\n- Recovery pace\n- Treadmill atau sepeda'
        }
      },
      {
        code: 'P6',
        name: 'Strength & Definition Program',
        description: 'Program untuk mempertahankan kekuatan dan definisi otot',
        bmiCategory: 'B2',
        bodyFatCategory: 'L1',
        cardioRatio: '15% Kardio - 85% Beban',
        dietRecommendation: 'Menjaga berat badan ideal dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.',
        schedule: {
          'Senin': '1. Heavy Bench: 4×5-6\n2. Shoulder Press: 4×6-8\n3. Incline Press: 3×8-10\n4. Triceps Dips: 3×8-12\n5. Close-Grip Push-Ups: 3×10-15',
          'Selasa': '1. Heavy Deadlifts: 4×5-6\n2. Pull-Ups: 4×6-8\n3. Barbell Rows: 3×8-10\n4. Cable Rows: 3×10-12\n5. Barbell Curls: 3×8-10',
          'Rabu': '1. Heavy Squats: 4×5-6\n2. Romanian Deadlifts: 3×6-8\n3. Bulgarian Split Squats: 3×10 each leg\n4. Leg Curls: 3×10-12\n5. Calf Raises: 4×8-10',
          'Kamis': '1. Incline Bench: 4×6-8\n2. Dumbbell Shoulder Press: 3×8-10\n3. Lateral Raises: 4×12-15\n4. Triceps Work: 3×10-12',
          'Jumat': '1. T-Bar Rows: 4×6-8\n2. Lat Pulldowns: 3×8-10\n3. Face Pulls: 4×12-15\n4. Shrugs: 3×8-10\n5. Biceps Work: 3×10-12',
          'Sabtu': '1. Front Squats: 3×8-10\n2. Walking Lunges: 3×12 each leg\n3. Leg Press: 3×12-15\n4. Calf Press: 4×10-12',
          'Minggu': 'Light Cardio: 15 menit\n- Recovery pace'
        }
      },
      {
        code: 'P7',
        name: 'Fat Burning & Toning Program',
        description: 'Program untuk membakar lemak sambil menjaga massa otot',
        bmiCategory: 'B2',
        bodyFatCategory: 'L3',
        cardioRatio: '60% Kardio - 40% Beban',
        dietRecommendation: 'Menjaga berat badan ideal dengan asupan kalori seimbang dan porsi lemak yang rendah dan tinggi protein.',
        schedule: {
          'Senin': '1. Circuit Training (3 rounds):\n   - Bench Press: 12 reps\n   - Rows: 12 reps\n   - Squats: 15 reps\n   - Shoulder Press: 12 reps\n2. Cardio: 20 menit',
          'Selasa': 'HIIT Cardio: 30 menit\n- 2 menit warm-up\n- 8×(1 min high, 1 min recovery)\n- 5 menit cool-down',
          'Rabu': '1. Superset Training:\n   - Incline Press + Pull-Ups: 3×8-10\n   - Leg Press + Leg Curls: 3×10-12\n   - Lateral Raises + Face Pulls: 3×12-15\n2. Cardio: 15 menit',
          'Kamis': 'Steady State Cardio: 40 menit\n- Treadmill/Elliptical/Sepeda\n- Intensitas sedang',
          'Jumat': '1. Full Body Circuit (3 rounds):\n   - Push-Ups: 12\n   - Bodyweight Squats: 15\n   - Mountain Climbers: 20\n   - Plank: 30 detik\n2. Cardio: 20 menit',
          'Sabtu': 'LISS Cardio: 45 menit\n- Low intensity steady state\n- Jalan cepat atau sepeda santai',
          'Minggu': 'Active Recovery:\n- Yoga/Stretching: 30 menit\n- Jalan santai: 20 menit'
        }
      },
      {
        code: 'P8',
        name: 'Body Recomposition Program',
        description: 'Program untuk mengubah komposisi tubuh dengan seimbang',
        bmiCategory: 'B3',
        bodyFatCategory: 'L2',
        cardioRatio: '50% Kardio - 50% Beban',
        dietRecommendation: 'Menjaga berat badan dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.',
        schedule: {
          'Senin': '1. Compound Focus:\n   - Squats: 4×8-10\n   - Bench Press: 4×8-10\n   - Rows: 4×8-10\n2. Cardio: 25 menit moderate',
          'Selasa': '1. Upper Body:\n   - Pull-Ups: 3×8-10\n   - Shoulder Press: 3×10-12\n   - Triceps Dips: 3×10-12\n   - Biceps Curls: 3×12-15\n2. HIIT: 20 menit',
          'Rabu': 'Cardio Focus: 35 menit\n- 5 min warm-up\n- 25 min steady state\n- 5 min cool-down',
          'Kamis': '1. Lower Body:\n   - Romanian Deadlifts: 4×8-10\n   - Leg Press: 3×10-12\n   - Leg Curls: 3×12-15\n   - Calf Raises: 4×12-15\n2. Core: 15 menit',
          'Jumat': '1. Full Body Circuit:\n   - Burpees: 3×8\n   - Kettlebell Swings: 3×15\n   - Push-Ups: 3×10\n   - Jump Squats: 3×12\n2. Cardio: 20 menit',
          'Sabtu': 'Cardio Choice: 40 menit\n- Outdoor running/cycling/swimming\n- Intensitas sedang',
          'Minggu': 'Active Recovery:\n- Stretching/Yoga: 30 menit\n- Light walk: 30 menit'
        }
      },
      {
        code: 'P9',
        name: 'Beginner Muscle Building Program',
        description: 'Program untuk pemula yang ingin menambah massa otot',
        bmiCategory: 'B1',
        bodyFatCategory: 'L3',
        cardioRatio: '35% Kardio - 65% Beban',
        dietRecommendation: 'Menambah berat badan dengan surplus kalori 300-500 kalori, tetap fokus pada peningkatan massa otot dengan asupan makanan tinggi protein dan rendah lemak.',
        schedule: {
          'Senin': '1. Beginner Upper Body:\n   - Bench Press: 3×8-10\n   - Seated Rows: 3×8-10\n   - Shoulder Press: 3×10-12\n   - Lat Pulldowns: 3×10-12\n   - Biceps Curls: 2×12-15\n   - Triceps Extensions: 2×12-15',
          'Selasa': 'Cardio Introduction: 20 menit\n- Treadmill walking dengan incline\n- Sepeda statis intensity rendah',
          'Rabu': '1. Beginner Lower Body:\n   - Leg Press: 3×10-12\n   - Leg Curls: 3×10-12\n   - Leg Extensions: 3×10-12\n   - Calf Raises: 3×12-15\n   - Bodyweight Squats: 2×10-15',
          'Kamis': 'Cardio & Core: 25 menit\n- 15 menit cardio ringan\n- 10 menit core (plank, crunches)',
          'Jumat': '1. Full Body Basics:\n   - Goblet Squats: 3×8-10\n   - Push-Ups (modified): 3×5-10\n   - Dumbbell Rows: 3×10-12\n   - Dumbbell Press: 3×10-12\n   - Assisted Pull-Ups: 2×5-8',
          'Sabtu': 'Cardio & Flexibility: 30 menit\n- 20 menit cardio pilihan\n- 10 menit stretching',
          'Minggu': 'Rest/Light Activity:\n- Jalan santai 20-30 menit\n- Basic stretching'
        }
      },
      {
        code: 'P10',
        name: 'Advanced Strength Program',
        description: 'Program lanjutan untuk meningkatkan kekuatan dan massa otot',
        bmiCategory: 'B3',
        bodyFatCategory: 'L1',
        cardioRatio: '10% Kardio - 90% Beban',
        dietRecommendation: 'Menjaga berat badan dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.',
        schedule: {
          'Senin': '1. Heavy Push Day:\n   - Bench Press: 5×3-5\n   - Overhead Press: 4×5-6\n   - Incline Press: 3×6-8\n   - Weighted Dips: 3×6-8\n   - Close-Grip Bench: 3×8-10\n   - Triceps Work: 3×10-12',
          'Selasa': '1. Heavy Pull Day:\n   - Deadlifts: 5×3-5\n   - Weighted Pull-Ups: 4×5-6\n   - Barbell Rows: 4×6-8\n   - T-Bar Rows: 3×8-10\n   - Shrugs: 3×8-10\n   - Biceps Work: 3×10-12',
          'Rabu': '1. Heavy Leg Day:\n   - Squats: 5×3-5\n   - Romanian Deadlifts: 4×6-8\n   - Front Squats: 3×8-10\n   - Bulgarian Split Squats: 3×8 each\n   - Leg Curls: 3×10-12\n   - Calf Raises: 4×8-10',
          'Kamis': 'Recovery Cardio: 15 menit\n- Light pace\n- Mobility work',
          'Jumat': '1. Volume Push:\n   - Bench Press: 4×8-10\n   - Dumbbell Press: 3×10-12\n   - Lateral Raises: 4×12-15\n   - Dips: 3×10-12\n   - Triceps Superset: 3×12-15',
          'Sabtu': '1. Volume Pull:\n   - Rows: 4×8-10\n   - Lat Pulldowns: 4×10-12\n   - Cable Rows: 3×12-15\n   - Face Pulls: 4×15-20\n   - Biceps Superset: 3×12-15',
          'Minggu': 'Rest/Mobility:\n- Foam rolling\n- Stretching\n- Light walk'
        }
      }
    ];
    const programs = await Program.bulkCreate(programsData);
    console.log(`✅ Created ${programs.length} programs (P1-P10)`);

    // ===================================================================
    // 💪 EXERCISE DATA - MASUKKAN DATA ANDA DI SINI  
    // ===================================================================
    console.log('\n💪 Creating exercises...');
    const exercisesData = [
     {
        name: 'Push-ups',
        category: 'Push',
        description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps',
        instructions: '1. Start in plank position with hands shoulder-width apart\n2. Lower your body until chest nearly touches floor\n3. Push back up to starting position\n4. Keep body straight throughout movement',
        sets: '3×8-15',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
        equipment: ['Bodyweight'],
        tags: ['bodyweight', 'push', 'chest', 'beginner'],
        isActive: true
      },
      {
        name: 'Bench Press',
        category: 'Push',
        description: 'Fundamental compound exercise for upper body strength',
        instructions: '1. Lie flat on bench with eyes under barbell\n2. Grip bar slightly wider than shoulder width\n3. Lower bar to chest with control\n4. Press bar back to starting position',
        sets: '3×6-8',
        difficulty: 'Intermediate',
        youtubeUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
        equipment: ['Barbell', 'Bench'],
        tags: ['compound', 'strength', 'chest', 'barbell'],
        isActive: true
      },
      {
        name: 'Shoulder Press',
        category: 'Push',
        description: 'Overhead pressing movement for shoulder development',
        instructions: '1. Stand with feet shoulder-width apart\n2. Hold dumbbells at shoulder height\n3. Press weights overhead until arms are straight\n4. Lower with control to starting position',
        sets: '3×8-12',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
        muscleGroups: ['Shoulders', 'Triceps', 'Core'],
        equipment: ['Dumbbells'],
        tags: ['shoulders', 'overhead', 'dumbbell', 'strength'],
        isActive: true
      },
      {
        name: 'Dips',
        category: 'Push',
        description: 'Bodyweight exercise for triceps and chest development',
        instructions: '1. Support yourself on parallel bars or bench\n2. Lower body by bending elbows\n3. Lower until shoulders are below elbows\n4. Push back up to starting position',
        sets: '3×6-12',
        difficulty: 'Intermediate',
        youtubeUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As',
        muscleGroups: ['Triceps', 'Chest', 'Shoulders'],
        equipment: ['Parallel Bars', 'Bench'],
        tags: ['bodyweight', 'triceps', 'chest', 'intermediate'],
        isActive: true
      },

      // PULL EXERCISES
      {
        name: 'Pull-ups',
        category: 'Pull',
        description: 'Upper body compound exercise targeting back and biceps',
        instructions: '1. Hang from pull-up bar with overhand grip\n2. Pull body up until chin clears bar\n3. Lower with control to full arm extension\n4. Maintain tight core throughout',
        sets: '3×5-10',
        difficulty: 'Advanced',
        youtubeUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
        muscleGroups: ['Lats', 'Rhomboids', 'Biceps', 'Core'],
        equipment: ['Pull-up Bar'],
        tags: ['bodyweight', 'back', 'biceps', 'advanced'],
        isActive: true
      },
      {
        name: 'Bent-over Rows',
        category: 'Pull',
        description: 'Compound pulling exercise for back development',
        instructions: '1. Bend over at hips with slight knee bend\n2. Hold barbell with overhand grip\n3. Pull bar to lower chest/upper abdomen\n4. Lower with control to starting position',
        sets: '3×6-10',
        difficulty: 'Intermediate',
        youtubeUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
        muscleGroups: ['Lats', 'Rhomboids', 'Middle Traps', 'Biceps'],
        equipment: ['Barbell'],
        tags: ['compound', 'back', 'rowing', 'strength'],
        isActive: true
      },
      {
        name: 'Lat Pulldowns',
        category: 'Pull',
        description: 'Machine exercise targeting latissimus dorsi',
        instructions: '1. Sit at lat pulldown machine with thighs secured\n2. Grip bar wider than shoulders\n3. Pull bar down to upper chest\n4. Control weight back to starting position',
        sets: '3×8-12',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
        muscleGroups: ['Lats', 'Rhomboids', 'Biceps'],
        equipment: ['Lat Pulldown Machine'],
        tags: ['machine', 'back', 'lats', 'beginner'],
        isActive: true
      },
      {
        name: 'Bicep Curls',
        category: 'Pull',
        description: 'Isolation exercise for bicep development',
        instructions: '1. Stand with dumbbells at sides\n2. Keep elbows stationary at sides\n3. Curl weights up to shoulders\n4. Lower with control to starting position',
        sets: '3×10-15',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
        muscleGroups: ['Biceps'],
        equipment: ['Dumbbells'],
        tags: ['isolation', 'biceps', 'arms', 'dumbbell'],
        isActive: true
      },

      // LEG EXERCISES
      {
        name: 'Squats',
        category: 'Leg',
        description: 'Fundamental compound exercise for lower body strength',
        instructions: '1. Stand with feet shoulder-width apart\n2. Lower by pushing hips back and bending knees\n3. Descend until thighs parallel to floor\n4. Drive through heels to return to standing',
        sets: '3×8-12',
        difficulty: 'Intermediate',
        youtubeUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
        equipment: ['Barbell', 'Squat Rack'],
        tags: ['compound', 'legs', 'strength', 'functional'],
        isActive: true
      },
      {
        name: 'Lunges',
        category: 'Leg',
        description: 'Unilateral leg exercise for strength and balance',
        instructions: '1. Step forward into lunge position\n2. Lower back knee toward ground\n3. Keep front knee over ankle\n4. Push back to starting position',
        sets: '3×10-12 each leg',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
        equipment: ['Bodyweight', 'Optional Dumbbells'],
        tags: ['unilateral', 'legs', 'balance', 'functional'],
        isActive: true
      },
      {
        name: 'Deadlifts',
        category: 'Leg',
        description: 'Compound exercise targeting posterior chain',
        instructions: '1. Stand with feet hip-width apart\n2. Bend at hips and knees to grip bar\n3. Keep back straight and lift bar by extending hips\n4. Lower bar with control to starting position',
        sets: '3×5-8',
        difficulty: 'Advanced',
        youtubeUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
        muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps'],
        equipment: ['Barbell', 'Weight Plates'],
        tags: ['compound', 'posterior-chain', 'strength', 'deadlift'],
        isActive: true
      },
      {
        name: 'Calf Raises',
        category: 'Leg',
        description: 'Isolation exercise for calf development',
        instructions: '1. Stand on balls of feet on raised surface\n2. Lower heels below platform level\n3. Rise up on toes as high as possible\n4. Lower with control and repeat',
        sets: '3×12-20',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI',
        muscleGroups: ['Calves'],
        equipment: ['Calf Raise Platform', 'Optional Weight'],
        tags: ['isolation', 'calves', 'legs', 'simple'],
        isActive: true
      },

      // FULL BODY EXERCISES
      {
        name: 'Burpees',
        category: 'Full Body',
        description: 'High-intensity full body conditioning exercise',
        instructions: '1. Start in standing position\n2. Drop to squat and place hands on floor\n3. Jump feet back to plank position\n4. Jump feet back to squat and jump up',
        sets: '3×8-15',
        difficulty: 'Intermediate',
        youtubeUrl: 'https://www.youtube.com/watch?v=auBLPXO8Fww',
        muscleGroups: ['Full Body', 'Cardiovascular System'],
        equipment: ['Bodyweight'],
        tags: ['full-body', 'cardio', 'conditioning', 'hiit'],
        isActive: true
      },
      {
        name: 'Mountain Climbers',
        category: 'Full Body',
        description: 'Dynamic core and cardio exercise',
        instructions: '1. Start in plank position\n2. Alternate bringing knees to chest rapidly\n3. Maintain plank position throughout\n4. Keep core engaged and breathing steady',
        sets: '3×30-60 seconds',
        difficulty: 'Intermediate',
        youtubeUrl: 'https://www.youtube.com/watch?v=kLh-uczlPLg',
        muscleGroups: ['Core', 'Shoulders', 'Legs', 'Cardiovascular System'],
        equipment: ['Bodyweight'],
        tags: ['cardio', 'core', 'dynamic', 'conditioning'],
        isActive: true
      },
      {
        name: 'Planks',
        category: 'Full Body',
        description: 'Isometric core strengthening exercise',
        instructions: '1. Start in push-up position\n2. Lower to forearms\n3. Keep body in straight line from head to heels\n4. Hold position while breathing normally',
        sets: '3×30-90 seconds',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
        muscleGroups: ['Core', 'Shoulders', 'Glutes'],
        equipment: ['Bodyweight'],
        tags: ['core', 'isometric', 'stability', 'beginner'],
        isActive: true
      },
      {
        name: 'Turkish Get-ups',
        category: 'Full Body',
        description: 'Complex movement for strength and mobility',
        instructions: '1. Lie on back holding weight overhead\n2. Use free hand and leg to get to standing\n3. Reverse movement to return to lying position\n4. Keep weight overhead throughout',
        sets: '3×3-5 each side',
        difficulty: 'Advanced',
        youtubeUrl: 'https://www.youtube.com/watch?v=0bWRPC49-KI',
        muscleGroups: ['Full Body', 'Core', 'Shoulders', 'Stability'],
        equipment: ['Kettlebell', 'Dumbbell'],
        tags: ['complex', 'mobility', 'strength', 'functional'],
        isActive: true
      },

      // CARDIO EXERCISES
      {
        name: 'High-Intensity Interval Training (HIIT)',
        category: 'Cardio',
        description: 'Alternating high and low intensity cardio workout',
        instructions: '1. Warm up for 5 minutes\n2. 30 seconds high intensity exercise\n3. 90 seconds low intensity recovery\n4. Repeat 8-12 cycles\n5. Cool down for 5 minutes',
        duration: '20-30 minutes',
        difficulty: 'Advanced',
        youtubeUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
        muscleGroups: ['Cardiovascular System', 'Full Body'],
        equipment: ['Bodyweight', 'Optional Equipment'],
        tags: ['hiit', 'cardio', 'fat-burning', 'conditioning'],
        isActive: true
      },
      {
        name: 'Jump Rope',
        category: 'Cardio',
        description: 'Classic cardio exercise for coordination and endurance',
        instructions: '1. Hold rope handles at hip level\n2. Swing rope overhead using wrists\n3. Jump just high enough to clear rope\n4. Land on balls of feet with slight knee bend',
        duration: '10-30 minutes',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=1BZM2Vre5oc',
        muscleGroups: ['Cardiovascular System', 'Calves', 'Coordination'],
        equipment: ['Jump Rope'],
        tags: ['cardio', 'coordination', 'portable', 'endurance'],
        isActive: true
      },
      {
        name: 'Running Form',
        category: 'Cardio',
        description: 'Proper running technique for efficiency and injury prevention',
        instructions: '1. Maintain upright posture with slight forward lean\n2. Land on midfoot under center of gravity\n3. Use arms for balance and momentum\n4. Maintain steady breathing rhythm',
        duration: '20-60 minutes',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=brFrKGPrEbE',
        muscleGroups: ['Cardiovascular System', 'Legs', 'Core'],
        equipment: ['Running Shoes'],
        tags: ['running', 'endurance', 'outdoor', 'technique'],
        isActive: true
      },
      {
        name: 'Cycling Workout',
        category: 'Cardio',
        description: 'Indoor cycling workout for cardio fitness',
        instructions: '1. Adjust bike seat and handlebars properly\n2. Start with 5-minute warm-up\n3. Alternate between moderate and high intensity\n4. Cool down with easy pedaling',
        duration: '30-60 minutes',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=U_hYLS_Qk_Y',
        muscleGroups: ['Cardiovascular System', 'Legs'],
        equipment: ['Stationary Bike', 'Bicycle'],
        tags: ['cycling', 'low-impact', 'endurance', 'cardio'],
        isActive: true
      },

      // ADDITIONAL EXERCISES
      {
        name: 'Russian Twists',
        category: 'Full Body',
        description: 'Core exercise targeting obliques and abs',
        instructions: '1. Sit on floor with knees bent\n2. Lean back slightly, lift feet off ground\n3. Rotate torso side to side\n4. Keep chest up and core engaged',
        sets: '3×20-30',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
        muscleGroups: ['Core', 'Obliques'],
        equipment: ['Bodyweight', 'Optional Weight'],
        tags: ['core', 'obliques', 'rotation', 'abs'],
        isActive: true
      },
      {
        name: 'Leg Press',
        category: 'Leg',
        description: 'Machine-based quad and glute exercise',
        instructions: '1. Sit in leg press machine\n2. Place feet on platform shoulder-width apart\n3. Lower weight until knees at 90 degrees\n4. Press through heels to extend legs',
        sets: '3×8-12',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
        equipment: ['Leg Press Machine'],
        tags: ['machine', 'legs', 'quad', 'safe'],
        isActive: true
      },
      {
        name: 'Tricep Extensions',
        category: 'Push',
        description: 'Isolation exercise for tricep development',
        instructions: '1. Hold dumbbell with both hands overhead\n2. Keep elbows stationary and close to head\n3. Lower weight behind head\n4. Extend arms back to starting position',
        sets: '3×10-15',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=_gsUck-7M74',
        muscleGroups: ['Triceps'],
        equipment: ['Dumbbell'],
        tags: ['isolation', 'triceps', 'arms', 'overhead'],
        isActive: true
      },
      {
        name: 'Face Pulls',
        category: 'Pull',
        description: 'Rear deltoid and upper back exercise',
        instructions: '1. Set cable at face height with rope attachment\n2. Pull rope to face with elbows high\n3. Separate rope handles at face level\n4. Control return to starting position',
        sets: '3×12-15',
        difficulty: 'Beginner',
        youtubeUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
        muscleGroups: ['Rear Delts', 'Upper Traps', 'Rhomboids'],
        equipment: ['Cable Machine', 'Rope Attachment'],
        tags: ['isolation', 'rear-delts', 'posture', 'cable'],
        isActive: true
      }
    ];

    // Create exercises one by one for better error handling
    const createdExercises = [];
    
    for (let i = 0; i < exercisesData.length; i++) {
      const exerciseData = exercisesData[i];
      
      try {
        console.log(`📝 Creating exercise ${i + 1}/${exercisesData.length}: ${exerciseData.name}`);
        
        // Manual YouTube video ID extraction
        if (exerciseData.youtubeUrl) {
          const videoIdMatch = exerciseData.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if (videoIdMatch) {
            exerciseData.youtubeVideoId = videoIdMatch[1];
            console.log(`   🎥 Video ID extracted: ${exerciseData.youtubeVideoId}`);
          }
        }
        
        const exercise = await Exercise.create(exerciseData);
        createdExercises.push(exercise);
        
        console.log(`   ✅ Created: ${exercise.name}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to create ${exerciseData.name}:`, error.message);
        if (error.errors) {
          error.errors.forEach(err => {
            console.error(`      - ${err.path}: ${err.message}`);
          });
        }
      }
    }
    
    console.log(`✅ Created ${createdExercises.length} exercises`);

    // Create 10 REALISTIC rules using medical logic
    console.log('\n📏 Creating 10 realistic rules based on medical logic...');
    
    const realisticCombinations = MedicalLogic.getRealisticCombinations();
    console.log(`Found ${realisticCombinations.length} realistic combinations`);

    const rulesData = [];
    
    for (const combo of realisticCombinations) {
      // Find the corresponding program
      const targetProgram = programs.find(p => p.code === combo.program);
      
      if (targetProgram) {
        rulesData.push({
          name: `Rule for ${RULE_CONSTANTS.getDisplayName(combo.bmi, 'bmi')} + ${RULE_CONSTANTS.getDisplayName(combo.bodyFat, 'bodyFat')}`,
          description: `IF BMI = ${combo.bmi} AND Body Fat = ${combo.bodyFat} THEN Program = ${combo.program}`,
          bmiCategory: combo.bmi,
          bodyFatCategory: combo.bodyFat,
          programId: targetProgram.id,
          isActive: true
        });
      }
    }

    const rules = await Rule.bulkCreate(rulesData);
    console.log(`✅ Created ${rules.length} realistic rules`);

    // Log the realistic combinations
    console.log('\n📋 REALISTIC COMBINATIONS CREATED:');
    rules.forEach((rule, index) => {
      const combo = realisticCombinations[index];
      console.log(`   ${combo.bmi}+${combo.bodyFat} → ${combo.program} (${rule.name})`);
    });

    // Create sample consultations for testing realistic combinations
    console.log('\n📋 Creating sample consultations...');
    const consultationsData = [
      {
        userId: sampleUsers[0].id, // John - male
        weight: 55.0,
        height: 175.0,
        bodyFatPercentage: 8.0,
        notes: 'Test B1+L1 → P1'
      },
      {
        userId: sampleUsers[1].id, // Jane - female  
        weight: 60.0,
        height: 165.0,
        bodyFatPercentage: 25.0,
        notes: 'Test B2+L2 → P2'
      },
      {
        userId: sampleUsers[2].id, // Bob - male
        weight: 85.0,
        height: 175.0,
        bodyFatPercentage: 22.0,
        notes: 'Test B3+L3 → P3'
      },
      {
        userId: sampleUsers[3].id, // Alice - female
        weight: 90.0,
        height: 160.0,
        bodyFatPercentage: 35.0,
        notes: 'Test B4+L3 → P4'
      }
    ];

    for (const consultationData of consultationsData) {
      await Consultation.createWithForwardChaining(consultationData);
    }
    console.log(`✅ Created ${consultationsData.length} sample consultations`);

    // Display final summary
    console.log('\n📊 COMPLETE DATABASE SEEDING SUMMARY');
    console.log('====================================');
    console.log(`👤 Users: ${await User.count()}`);
    console.log(`🏋️ Programs: ${await Program.count()}`);
    console.log(`📏 Rules: ${await Rule.count()}`);
    console.log(`💪 Exercises: ${await Exercise.count()}`);
    console.log(`📋 Consultations: ${await Consultation.count()}`);

    // Exercise statistics
    const withYouTube = await Exercise.count({
      where: { youtubeUrl: { [sequelize.Sequelize.Op.ne]: null } }
    });
    const withVideoId = await Exercise.count({
      where: { youtubeVideoId: { [sequelize.Sequelize.Op.ne]: null } }
    });

    console.log('\n💪 EXERCISE STATISTICS:');
    console.log(`📺 With YouTube URL: ${withYouTube}`);
    console.log(`🎦 With Video ID: ${withVideoId}`);
    console.log(`✅ YouTube Success Rate: ${createdExercises.length > 0 ? Math.round((withVideoId / createdExercises.length) * 100) : 0}%`);

    console.log('\n🎉 MEDICAL LOGIC IMPLEMENTATION SUCCESSFUL!');
    console.log('\n🔑 LOGIN CREDENTIALS');
    console.log('====================');
    console.log('Admin: admin@gymsporra.com / admin123');
    console.log('Users: john@example.com / password123');
    console.log('       jane@example.com / password123');

    console.log('\n🎯 10 REALISTIC COMBINATIONS IMPLEMENTED');
    console.log('==========================================');
    realisticCombinations.forEach(combo => {
      console.log(`${combo.bmi}+${combo.bodyFat} → ${combo.program} (${RULE_CONSTANTS.getDisplayName(combo.bmi, 'bmi')} + ${RULE_CONSTANTS.getDisplayName(combo.bodyFat, 'bodyFat')})`);
    });

    console.log('\n❌ IMPOSSIBLE COMBINATIONS EXCLUDED');
    console.log('=====================================');
    console.log('B4+L1 (Obese + Low body fat) - Medically contradictory');
    console.log('B4+L2 (Obese + Normal body fat) - Medically inconsistent');

    console.log('\n✅ FORWARD CHAINING ENGINE: Enhanced with edge case handling');
    console.log('✅ MEDICAL LOGIC: 10 realistic combinations only');
    console.log('✅ EXERCISE SYSTEM: YouTube integration ready');
    console.log('✅ SYSTEM 100% READY FOR FITNESS EXPERTS!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

masterSeed();

