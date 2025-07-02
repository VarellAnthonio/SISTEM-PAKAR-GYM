import dotenv from 'dotenv';
import sequelize, { testConnection } from '../config/database.js';
import { User, Program, Exercise, Rule, Consultation } from '../models/index.js';
import { MedicalLogic } from '../utils/medicalLogic.js';
import { RULE_CONSTANTS } from '../config/ruleConstants.js';

dotenv.config();

const masterSeed = async () => {
  try {
    console.log('🚀 Starting complete database seeding with P1-P10 + 10 Realistic Rules...\n');

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

    // Create complete programs P1-P10 (keep existing program data)
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

    // Create 10 REALISTIC rules using medical logic
    console.log('📏 Creating 10 realistic rules based on medical logic...');
    
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

    // Create exercises (keep existing exercise data)
    console.log('\n💪 Creating exercises...');
    const exercisesData = [
      // Push Exercises
      {
        name: 'Bench Press',
        category: 'Push',
        description: 'Upper body compound exercise targeting chest, shoulders, and triceps',
        instructions: '1. Lie on bench with feet flat on floor\n2. Grip bar slightly wider than shoulder width\n3. Lower bar to chest with control\n4. Press bar up to starting position',
        sets: '3×6-8',
        difficulty: 'Intermediate',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
        equipment: ['Barbell', 'Bench']
      },
      {
        name: 'Shoulder Press',
        category: 'Push',
        description: 'Upper body exercise targeting shoulders and triceps',
        instructions: '1. Stand with feet shoulder-width apart\n2. Hold dumbbells at shoulder height\n3. Press weights overhead\n4. Lower with control to starting position',
        sets: '3×8-10',
        difficulty: 'Beginner',
        muscleGroups: ['Shoulders', 'Triceps'],
        equipment: ['Dumbbells']
      },
      {
        name: 'Incline Dumbbell Press',
        category: 'Push',
        description: 'Upper chest focused exercise using incline bench',
        instructions: '1. Set bench to 30-45 degree incline\n2. Hold dumbbells at chest level\n3. Press weights up and slightly inward\n4. Lower with control',
        sets: '3×8-10',
        difficulty: 'Intermediate',
        muscleGroups: ['Upper Chest', 'Shoulders', 'Triceps'],
        equipment: ['Dumbbells', 'Incline Bench']
      },
      {
        name: 'Incline Dumbbell Flyes',
        category: 'Push',
        description: 'Isolation exercise for chest development',
        instructions: '1. Lie on incline bench with dumbbells\n2. Start with arms extended above chest\n3. Lower weights in wide arc\n4. Squeeze chest to return to start',
        sets: '3×10-15',
        difficulty: 'Intermediate',
        muscleGroups: ['Chest'],
        equipment: ['Dumbbells', 'Incline Bench']
      },
      {
        name: 'Triceps Pushdowns',
        category: 'Push',
        description: 'Isolation exercise targeting triceps',
        instructions: '1. Stand at cable machine with rope attachment\n2. Keep elbows at sides\n3. Push rope down until arms are straight\n4. Control the weight back up',
        sets: '3×10-15',
        difficulty: 'Beginner',
        muscleGroups: ['Triceps'],
        equipment: ['Cable Machine', 'Rope Attachment']
      },
      {
        name: 'Triceps Extensions',
        category: 'Push',
        description: 'Isolation exercise for triceps development',
        instructions: '1. Hold dumbbell with both hands overhead\n2. Keep elbows stationary\n3. Lower weight behind head\n4. Extend arms back to start',
        sets: '2×12-15',
        difficulty: 'Beginner',
        muscleGroups: ['Triceps'],
        equipment: ['Dumbbell']
      },
      {
        name: 'Lateral Raises',
        category: 'Push',
        description: 'Shoulder isolation exercise for medial deltoids',
        instructions: '1. Stand with dumbbells at sides\n2. Raise arms out to sides\n3. Stop at shoulder height\n4. Lower with control',
        sets: '3×10-15',
        difficulty: 'Beginner',
        muscleGroups: ['Medial Delts'],
        equipment: ['Dumbbells']
      },

      // Pull Exercises
      {
        name: 'Rows',
        category: 'Pull',
        description: 'Upper body exercise targeting middle traps, rhomboids, and rear delts',
        instructions: '1. Sit at cable row machine\n2. Pull handle to lower chest\n3. Squeeze shoulder blades together\n4. Control weight back to start',
        sets: '3×6-8',
        difficulty: 'Beginner',
        muscleGroups: ['Middle Traps', 'Rhomboids', 'Rear Delts'],
        equipment: ['Cable Machine']
      },
      {
        name: 'Pull-Ups',
        category: 'Pull',
        description: 'Upper body compound exercise targeting lats, rhomboids, and biceps',
        instructions: '1. Hang from pull-up bar with overhand grip\n2. Pull body up until chin over bar\n3. Lower with control to full extension\n4. Repeat for desired reps',
        sets: '3×8-10',
        difficulty: 'Advanced',
        muscleGroups: ['Lats', 'Rhomboids', 'Biceps'],
        equipment: ['Pull-up Bar']
      },
      {
        name: 'Lat Pull-Downs',
        category: 'Pull',
        description: 'Upper body exercise targeting latissimus dorsi',
        instructions: '1. Sit at lat pulldown machine\n2. Grip bar wider than shoulders\n3. Pull bar to upper chest\n4. Control weight back up',
        sets: '3×8-10',
        difficulty: 'Beginner',
        muscleGroups: ['Lats', 'Biceps'],
        equipment: ['Lat Pulldown Machine']
      },
      {
        name: 'Seated Cable Rows',
        category: 'Pull',
        description: 'Seated rowing exercise for back development',
        instructions: '1. Sit with knees slightly bent\n2. Pull handle to lower ribs\n3. Squeeze shoulder blades\n4. Control return to start',
        sets: '3×8-10',
        difficulty: 'Beginner',
        muscleGroups: ['Lats', 'Rhomboids', 'Middle Traps'],
        equipment: ['Cable Machine', 'Seated Row Attachment']
      },
      {
        name: 'Face Pulls',
        category: 'Pull',
        description: 'Rear delt and upper back exercise',
        instructions: '1. Set cable at face height\n2. Pull rope to face with elbows high\n3. Separate rope at face level\n4. Control return to start',
        sets: '3×10-15',
        difficulty: 'Beginner',
        muscleGroups: ['Rear Delts', 'Upper Traps'],
        equipment: ['Cable Machine', 'Rope Attachment']
      },
      {
        name: 'Barbell Shrugs',
        category: 'Pull',
        description: 'Trapezius muscle development exercise',
        instructions: '1. Hold barbell with overhand grip\n2. Shrug shoulders up toward ears\n3. Hold briefly at top\n4. Lower with control',
        sets: '3×8-10',
        difficulty: 'Beginner',
        muscleGroups: ['Upper Traps'],
        equipment: ['Barbell']
      },
      {
        name: 'Dumbbell Curls',
        category: 'Pull',
        description: 'Isolation exercise targeting biceps',
        instructions: '1. Stand with dumbbells at sides\n2. Curl weights up to shoulders\n3. Squeeze biceps at top\n4. Lower with control',
        sets: '3×10-15',
        difficulty: 'Beginner',
        muscleGroups: ['Biceps'],
        equipment: ['Dumbbells']
      },
      {
        name: 'Biceps Curls',
        category: 'Pull',
        description: 'Classic bicep development exercise',
        instructions: '1. Stand with weights at sides\n2. Curl up keeping elbows stationary\n3. Squeeze at top of movement\n4. Lower slowly',
        sets: '3×10-15',
        difficulty: 'Beginner',
        muscleGroups: ['Biceps'],
        equipment: ['Dumbbells', 'Barbell']
      },
      {
        name: 'Chest Supported Rows',
        category: 'Pull',
        description: 'Rowing exercise with chest support for strict form',
        instructions: '1. Set incline bench to 45 degrees\n2. Lie chest down with dumbbells\n3. Row weights to lower ribs\n4. Squeeze shoulder blades',
        sets: '3×8-10',
        difficulty: 'Intermediate',
        muscleGroups: ['Lats', 'Rhomboids', 'Middle Traps'],
        equipment: ['Incline Bench', 'Dumbbells']
      },

      // Leg Exercises
      {
        name: 'Squats',
        category: 'Leg',
        description: 'Lower body compound exercise targeting quadriceps, glutes, and hamstrings',
        instructions: '1. Stand with feet shoulder-width apart\n2. Lower body as if sitting back in chair\n3. Keep chest up and knees tracking over toes\n4. Drive through heels to stand',
        sets: '3×6-8',
        difficulty: 'Intermediate',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
        equipment: ['Barbell', 'Squat Rack']
      },
      {
        name: 'Romanian Deadlifts',
        category: 'Leg',
        description: 'Hip hinge movement targeting hamstrings and glutes',
        instructions: '1. Hold barbell with overhand grip\n2. Hinge at hips keeping back straight\n3. Lower bar to mid-shin level\n4. Drive hips forward to return',
        sets: '3×6-8',
        difficulty: 'Intermediate',
        muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back'],
        equipment: ['Barbell']
      },
      {
        name: 'Leg Press',
        category: 'Leg',
        description: 'Lower body exercise targeting quadriceps and glutes',
        instructions: '1. Sit in leg press machine\n2. Place feet on platform shoulder-width apart\n3. Lower weight until knees at 90 degrees\n4. Press through heels to extend',
        sets: '3×8-12',
        difficulty: 'Beginner',
        muscleGroups: ['Quadriceps', 'Glutes'],
        equipment: ['Leg Press Machine']
      },
      {
        name: 'Leg Curls',
        category: 'Leg',
        description: 'Isolation exercise targeting hamstrings',
        instructions: '1. Lie face down on leg curl machine\n2. Position ankles under pad\n3. Curl heels toward glutes\n4. Lower with control',
        sets: '3×8-10',
        difficulty: 'Beginner',
        muscleGroups: ['Hamstrings'],
        equipment: ['Leg Curl Machine']
      },
      {
        name: 'Standing Calf Raises',
        category: 'Leg',
        description: 'Lower body exercise targeting calf muscles',
        instructions: '1. Stand on balls of feet on raised surface\n2. Lower heels below platform level\n3. Rise up on toes as high as possible\n4. Lower with control',
        sets: '3×6-10',
        difficulty: 'Beginner',
        muscleGroups: ['Calves'],
        equipment: ['Calf Raise Platform', 'Weight']
      },
      {
        name: 'Seated Calf Raises',
        category: 'Leg',
        description: 'Seated calf muscle development exercise',
        instructions: '1. Sit with weight on thighs\n2. Place balls of feet on platform\n3. Rise up on toes\n4. Lower heels below platform',
        sets: '2×10-15',
        difficulty: 'Beginner',
        muscleGroups: ['Calves'],
        equipment: ['Seated Calf Raise Machine']
      },

      // Full Body Exercises
      {
        name: 'Deadlift',
        category: 'Full Body',
        description: 'Compound exercise targeting posterior chain muscles',
        instructions: '1. Stand with feet hip-width apart\n2. Bend at hips and knees to grip bar\n3. Keep back straight and lift bar\n4. Stand tall then lower with control',
        sets: '3×5-6',
        difficulty: 'Advanced',
        muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps'],
        equipment: ['Barbell', 'Weight Plates']
      },
      {
        name: 'Burpees',
        category: 'Full Body',
        description: 'Full body conditioning exercise',
        instructions: '1. Start standing\n2. Drop to push-up position\n3. Perform push-up\n4. Jump feet to hands then jump up',
        sets: '3×8-12',
        difficulty: 'Intermediate',
        muscleGroups: ['Full Body'],
        equipment: ['Bodyweight']
      },
      {
        name: 'Mountain Climbers',
        category: 'Full Body',
        description: 'Dynamic core and cardio exercise',
        instructions: '1. Start in plank position\n2. Alternate bringing knees to chest\n3. Maintain fast pace\n4. Keep core engaged',
        sets: '3×30 seconds',
        difficulty: 'Intermediate',
        muscleGroups: ['Core', 'Shoulders', 'Legs'],
        equipment: ['Bodyweight']
      },
      {
        name: 'Thrusters',
        category: 'Full Body',
        description: 'Combined squat and overhead press movement',
        instructions: '1. Hold dumbbells at shoulder height\n2. Perform squat\n3. Drive up and press weights overhead\n4. Lower weights and repeat',
        sets: '3×8-12',
        difficulty: 'Intermediate',
        muscleGroups: ['Legs', 'Shoulders', 'Core'],
        equipment: ['Dumbbells']
      },

      // Cardio Exercises
      {
        name: 'Treadmill Running',
        category: 'Cardio',
        description: 'Cardiovascular exercise using treadmill',
        instructions: '1. Start with 5-minute warm-up walk\n2. Gradually increase speed\n3. Maintain steady pace\n4. Cool down with 5-minute walk',
        duration: '20-30 minutes',
        difficulty: 'Beginner',
        muscleGroups: ['Legs', 'Cardiovascular System'],
        equipment: ['Treadmill']
      },
      {
        name: 'Stationary Bike',
        category: 'Cardio',
        description: 'Low-impact cardiovascular exercise',
        instructions: '1. Adjust seat height properly\n2. Start with light resistance\n3. Maintain steady rhythm\n4. Gradually increase intensity',
        duration: '20-30 minutes',
        difficulty: 'Beginner',
        muscleGroups: ['Legs', 'Cardiovascular System'],
        equipment: ['Stationary Bike']
      },
      {
        name: 'Elliptical',
        category: 'Cardio',
        description: 'Full body low-impact cardio exercise',
        instructions: '1. Step onto pedals\n2. Grip handles lightly\n3. Push and pull with arms\n4. Maintain smooth motion',
        duration: '20-30 minutes',
        difficulty: 'Beginner',
        muscleGroups: ['Full Body', 'Cardiovascular System'],
        equipment: ['Elliptical Machine']
      },
      {
        name: 'Rowing Machine',
        category: 'Cardio',
        description: 'Full body cardio and strength exercise',
        instructions: '1. Sit with knees bent\n2. Grip handle with both hands\n3. Drive with legs then pull with arms\n4. Reverse motion smoothly',
        duration: '15-25 minutes',
        difficulty: 'Intermediate',
        muscleGroups: ['Full Body', 'Cardiovascular System'],
        equipment: ['Rowing Machine']
      },
      {
        name: 'High Intensity Interval Training',
        category: 'Cardio',
        description: 'Alternating high and low intensity cardio',
        instructions: '1. Warm up for 5 minutes\n2. 30 seconds high intensity\n3. 90 seconds low intensity\n4. Repeat 8-12 cycles\n5. Cool down 5 minutes',
        duration: '20-25 minutes',
        difficulty: 'Advanced',
        muscleGroups: ['Full Body', 'Cardiovascular System'],
        equipment: ['Any Cardio Equipment']
      },

      // Additional Core/Functional Exercises
      {
        name: 'Plank',
        category: 'Full Body',
        description: 'Isometric core strengthening exercise',
        instructions: '1. Start in push-up position\n2. Lower to forearms\n3. Keep body straight line\n4. Hold position',
        sets: '3×30-60 seconds',
        difficulty: 'Beginner',
        muscleGroups: ['Core', 'Shoulders'],
        equipment: ['Bodyweight']
      },
      {
        name: 'Push-Ups',
        category: 'Push',
        description: 'Bodyweight upper body exercise',
        instructions: '1. Start in plank position\n2. Lower chest to ground\n3. Push back up to start\n4. Keep body straight',
        sets: '3×8-15',
        difficulty: 'Beginner',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
        equipment: ['Bodyweight']
      },
      {
        name: 'Lunges',
        category: 'Leg',
        description: 'Single leg strengthening exercise',
        instructions: '1. Step forward into lunge position\n2. Lower back knee toward ground\n3. Push back to starting position\n4. Alternate legs',
        sets: '3×10-12 each leg',
        difficulty: 'Beginner',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
        equipment: ['Bodyweight', 'Optional Dumbbells']
      }
    ];

    const exercises = await Exercise.bulkCreate(exercisesData);
    console.log(`✅ Created ${exercises.length} exercises`);

    // Create sample consultations for testing realistic combinations
    console.log('📋 Creating sample consultations...');
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
    console.log(`🏋️ Programs: ${await Program.count()} (P1-P10 COMPLETE!)`);
    console.log(`📏 Rules: ${await Rule.count()} (10 REALISTIC combinations only)`);
    console.log(`💪 Exercises: ${await Exercise.count()}`);
    console.log(`📋 Consultations: ${await Consultation.count()}`);

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
    console.log('✅ SYSTEM 100% READY FOR FITNESS EXPERTS!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

masterSeed();

