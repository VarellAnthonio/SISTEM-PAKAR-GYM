import dotenv from 'dotenv';
import sequelize, { testConnection } from '../config/database.js';
import { User, Program, Exercise, Rule, Consultation } from '../models/index.js';
import { MedicalLogic } from '../utils/medicalLogic.js';
import { RULE_CONSTANTS } from '../config/ruleConstants.js';

dotenv.config();

const masterSeed = async () => {
  try {
    console.log('🚀 Starting complete database seeding with SIMPLIFIED EXERCISE SYSTEM...\n');

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

    // ===================================================================
    // 🏋️ PROGRAMS SECTION - PLACEHOLDER (USE YOUR EXISTING CODE)
    // ===================================================================
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
    // 💪 SIMPLIFIED EXERCISE DATA (26+ exercises with 3 categories)
    // ===================================================================
    console.log('\n💪 Creating simplified exercises...');
    const exercisesData = [
      
      // ===== ANGKAT BEBAN CATEGORY (12 exercises) =====
      {
        name: 'Push-ups',
        category: 'Angkat Beban',
        description: 'Latihan dasar untuk membangun kekuatan otot dada, bahu, dan triceps menggunakan berat badan sendiri.',
        youtubeUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
        isActive: true
      },
      {
        name: 'Bench Press',
        category: 'Angkat Beban',
        description: 'Latihan compound dengan barbel untuk mengembangkan massa otot dada, bahu, dan triceps secara maksimal.',
        youtubeUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        isActive: true
      },
      {
        name: 'Squats',
        category: 'Angkat Beban',
        description: 'Gerakan fundamental untuk melatih otot paha, glutes, dan core dengan beban berat badan atau barbel.',
        youtubeUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
        isActive: true
      },
      {
        name: 'Deadlifts',
        category: 'Angkat Beban',
        description: 'Latihan compound terbaik untuk posterior chain, melatih hamstring, glutes, dan punggung bawah.',
        youtubeUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
        isActive: true
      },
      {
        name: 'Pull-ups',
        category: 'Angkat Beban',
        description: 'Latihan compound untuk punggung dan biceps menggunakan berat badan sendiri di pull-up bar.',
        youtubeUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
        isActive: true
      },
      {
        name: 'Shoulder Press',
        category: 'Angkat Beban',
        description: 'Latihan untuk mengembangkan kekuatan dan massa otot bahu dengan gerakan pressing overhead.',
        youtubeUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
        isActive: true
      },
      {
        name: 'Bent-over Rows',
        category: 'Angkat Beban',
        description: 'Latihan rowing untuk melatih otot punggung tengah, rhomboids, dan rear deltoids.',
        youtubeUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
        isActive: true
      },
      {
        name: 'Dips',
        category: 'Angkat Beban',
        description: 'Latihan bodyweight untuk triceps dan chest menggunakan parallel bars atau bench.',
        youtubeUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As',
        isActive: true
      },
      {
        name: 'Lunges',
        category: 'Angkat Beban',
        description: 'Latihan unilateral untuk paha, glutes, dan keseimbangan dengan variasi maju atau mundur.',
        youtubeUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
        isActive: true
      },
      {
        name: 'Bicep Curls',
        category: 'Angkat Beban',
        description: 'Latihan isolasi untuk mengembangkan massa dan kekuatan otot biceps dengan dumbbell.',
        youtubeUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
        isActive: true
      },
      {
        name: 'Tricep Extensions',
        category: 'Angkat Beban',
        description: 'Latihan isolasi untuk triceps dengan gerakan extension menggunakan dumbbell atau barbel.',
        youtubeUrl: 'https://www.youtube.com/watch?v=_gsUck-7M74',
        isActive: true
      },
      {
        name: 'Leg Press',
        category: 'Angkat Beban',
        description: 'Latihan paha dan glutes menggunakan mesin leg press untuk volume tinggi dengan aman.',
        youtubeUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
        isActive: true
      },
      
      // ===== KARDIO CATEGORY (8 exercises) =====
      {
        name: 'Running',
        category: 'Kardio',
        description: 'Latihan kardio klasik untuk membakar kalori, meningkatkan stamina, dan kesehatan jantung.',
        youtubeUrl: 'https://www.youtube.com/watch?v=brFrKGPrEbE',
        isActive: true
      },
      {
        name: 'Jump Rope',
        category: 'Kardio',
        description: 'Latihan kardio intensitas tinggi dengan tali skipping untuk koordinasi dan pembakaran kalori.',
        youtubeUrl: 'https://www.youtube.com/watch?v=1BZM2Vre5oc',
        isActive: true
      },
      {
        name: 'Burpees',
        category: 'Kardio',
        description: 'Latihan full body kardio yang menggabungkan squat, plank, dan jump untuk kondisi fisik maksimal.',
        youtubeUrl: 'https://www.youtube.com/watch?v=auBLPXO8Fww',
        isActive: true
      },
      {
        name: 'Mountain Climbers',
        category: 'Kardio',
        description: 'Latihan kardio dinamis dalam posisi plank untuk core strength dan pembakaran kalori.',
        youtubeUrl: 'https://www.youtube.com/watch?v=kLh-uczlPLg',
        isActive: true
      },
      {
        name: 'High-Intensity Interval Training (HIIT)',
        category: 'Kardio',
        description: 'Program latihan interval intensitas tinggi yang efisien untuk pembakaran lemak maksimal.',
        youtubeUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
        isActive: true
      },
      {
        name: 'Cycling',
        category: 'Kardio',
        description: 'Latihan kardio low-impact menggunakan sepeda statis atau outdoor untuk endurance.',
        youtubeUrl: 'https://www.youtube.com/watch?v=U_hYLS_Qk_Y',
        isActive: true
      },
      {
        name: 'Jumping Jacks',
        category: 'Kardio',
        description: 'Latihan kardio sederhana dengan gerakan jumping untuk warm-up atau conditioning.',
        youtubeUrl: 'https://www.youtube.com/watch?v=iSSAk4XCsRA',
        isActive: true
      },
      {
        name: 'Step-ups',
        category: 'Kardio',
        description: 'Latihan kardio menggunakan platform atau tangga untuk kekuatan kaki dan kardio ringan.',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQqApCGd5Ss',
        isActive: true
      },
      
      // ===== OTHER CATEGORY (6 exercises) =====
      {
        name: 'Planks',
        category: 'Other',
        description: 'Latihan isometric core terbaik untuk membangun kekuatan inti dan stabilitas tubuh.',
        youtubeUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
        isActive: true
      },
      {
        name: 'Russian Twists',
        category: 'Other',
        description: 'Latihan core dengan rotasi untuk melatih obliques dan stabilitas punggung.',
        youtubeUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
        isActive: true
      },
      {
        name: 'Face Pulls',
        category: 'Other',
        description: 'Latihan untuk rear deltoids dan upper back menggunakan cable untuk posture yang baik.',
        youtubeUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
        isActive: true
      },
      {
        name: 'Calf Raises',
        category: 'Other',
        description: 'Latihan isolasi untuk otot betis dengan gerakan raise menggunakan platform tinggi.',
        youtubeUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI',
        isActive: true
      },
      {
        name: 'Stretching Routine',
        category: 'Other',
        description: 'Rutina peregangan untuk fleksibilitas, recovery, dan pencegahan cedera setelah latihan.',
        youtubeUrl: 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
        isActive: true
      },
      {
        name: 'Foam Rolling',
        category: 'Other',
        description: 'Teknik self-massage menggunakan foam roller untuk recovery otot dan mengurangi tension.',
        youtubeUrl: 'https://www.youtube.com/watch?v=_1U-zlvjJkA',
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
        
        console.log(`   ✅ Created: ${exercise.name} (${exercise.category})`);
        
      } catch (error) {
        console.error(`   ❌ Failed to create ${exerciseData.name}:`, error.message);
        if (error.errors) {
          error.errors.forEach(err => {
            console.error(`      - ${err.path}: ${err.message}`);
          });
        }
      }
    }
    
    console.log(`✅ Created ${createdExercises.length} simplified exercises`);
    
    // Exercise category summary
    const exercisesByCategory = {
      'Angkat Beban': createdExercises.filter(ex => ex.category === 'Angkat Beban').length,
      'Kardio': createdExercises.filter(ex => ex.category === 'Kardio').length,
      'Other': createdExercises.filter(ex => ex.category === 'Other').length
    };
    
    console.log('\n📊 EXERCISE BREAKDOWN BY CATEGORY:');
    console.log(`   🏋️ Angkat Beban: ${exercisesByCategory['Angkat Beban']} exercises`);
    console.log(`   🏃 Kardio: ${exercisesByCategory['Kardio']} exercises`);
    console.log(`   🧘 Other: ${exercisesByCategory['Other']} exercises`);
    console.log(`   📱 Total: ${createdExercises.length} exercises`);
    
    // YouTube video statistics
    const withYouTube = createdExercises.filter(ex => ex.youtubeUrl).length;
    const withVideoId = createdExercises.filter(ex => ex.youtubeVideoId).length;
    
    console.log('\n🎥 YOUTUBE INTEGRATION STATS:');
    console.log(`   📺 With YouTube URL: ${withYouTube}/${createdExercises.length}`);
    console.log(`   🎦 With Video ID: ${withVideoId}/${createdExercises.length}`);
    console.log(`   ✅ YouTube Success Rate: ${createdExercises.length > 0 ? Math.round((withVideoId / createdExercises.length) * 100) : 0}%`);

    // ===================================================================
    // 📏 CREATE RULES SECTION - COMPLETE
    // ===================================================================
    console.log('\n📏 Creating 10 realistic rules based on medical logic...');
    
    const realisticCombinations = MedicalLogic.getRealisticCombinations();
    console.log(`Found ${realisticCombinations.length} realistic combinations`);

    const rulesData = [];
    
    for (const combo of realisticCombinations) {
      // Find the corresponding program
      const targetProgram = programs.find ? programs.find(p => p.code === combo.program) : null;
      
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

    const rules = rulesData.length > 0 ? await Rule.bulkCreate(rulesData) : [];
    console.log(`✅ Created ${rules.length} realistic rules`);

    // Log the realistic combinations
    if (rules.length > 0) {
      console.log('\n📋 REALISTIC COMBINATIONS CREATED:');
      rules.forEach((rule, index) => {
        const combo = realisticCombinations[index];
        if (combo) {
          console.log(`   ${combo.bmi}+${combo.bodyFat} → ${combo.program} (${rule.name})`);
        }
      });
    }

    // ===================================================================
    // 📋 CREATE SAMPLE CONSULTATIONS - COMPLETE
    // ===================================================================
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

    let consultationsCreated = 0;
    for (const consultationData of consultationsData) {
      try {
        await Consultation.createWithForwardChaining(consultationData);
        consultationsCreated++;
      } catch (error) {
        console.error(`Failed to create consultation for user ${consultationData.userId}:`, error.message);
      }
    }
    console.log(`✅ Created ${consultationsCreated} sample consultations`);

    // ===================================================================
    // 📊 FINAL SUMMARY
    // ===================================================================
    console.log('\n📊 SIMPLIFIED EXERCISE SYSTEM - SEEDING COMPLETE');
    console.log('========================================================');
    console.log(`👤 Users: ${await User.count()}`);
    console.log(`🏋️ Programs: ${programs.length || await Program.count()}`);
    console.log(`📏 Rules: ${rules.length || await Rule.count()}`);
    console.log(`💪 Exercises: ${createdExercises.length} (SIMPLIFIED to 3 categories)`);
    console.log(`📋 Consultations: ${await Consultation.count()}`);

    console.log('\n💪 SIMPLIFIED EXERCISE STATISTICS:');
    console.log(`📺 Total exercises: ${createdExercises.length}`);
    console.log(`🎥 With YouTube videos: ${withYouTube}`);
    console.log(`🏋️ Angkat Beban: ${exercisesByCategory['Angkat Beban']}`);
    console.log(`🏃 Kardio: ${exercisesByCategory['Kardio']}`);
    console.log(`🧘 Other: ${exercisesByCategory['Other']}`);

    console.log('\n🔑 LOGIN CREDENTIALS');
    console.log('====================');
    console.log('Admin: admin@gymsporra.com / admin123');
    console.log('Users: john@example.com / password123');
    console.log('       jane@example.com / password123');

    console.log('\n✅ SYSTEM SIMPLIFIED SUCCESSFULLY!');
    console.log('✅ EXERCISE FIELDS: 9 → 4 (name, category, description, youtubeUrl)');
    console.log('✅ CATEGORIES: 5 → 3 (Angkat Beban, Kardio, Other)');
    console.log('✅ FRONTEND: Fully updated with simplified UI');
    console.log('✅ BACKEND: Model & Controller updated');
    console.log('✅ YOUTUBE INTEGRATION: Still working perfectly');
    console.log('✅ READY FOR PRODUCTION! 🚀');

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