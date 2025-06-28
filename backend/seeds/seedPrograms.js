import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import { Program, Rule, Exercise } from '../models/index.js';

dotenv.config();

const seedPrograms = async () => {
  try {
    console.log('🌱 Starting to seed programs...');

    // Clear existing data
    await Rule.destroy({ where: {} });
    await Program.destroy({ where: {} });
    
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
          'Senin': '1. Bench Press: 3×6-8\n2. Rows: 3×6-8\n3. Shoulder Press: 3×8-10\n4. Pull-Ups: 3×8-10\n5. Incline Dumbbell Flyes: 2×10-15\n6. Dumbbell Curls: 2×12-15\n7. Triceps Extensions: 2×12-15',
          'Selasa': 'Cardio (Treadmill/Sepeda Statis)',
          'Rabu': 'Cardio (Treadmill/Sepeda Statis)',
          'Kamis': '1. Squats: 3×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Standing Calf Raises: 4×6-8',
          'Jumat': 'Cardio (Treadmill/Sepeda Statis)',
          'Sabtu': 'Cardio (Treadmill/Sepeda Statis)',
          'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
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
        code: 'P6',
        name: 'Strength & Definition Program',
        description: 'Program untuk mempertahankan kekuatan dan definisi otot',
        bmiCategory: 'B2',
        bodyFatCategory: 'L1',
        cardioRatio: '15% Kardio - 85% Beban',
        dietRecommendation: 'Menjaga berat badan ideal dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.',
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
        code: 'P7',
        name: 'Fat Burning & Toning Program',
        description: 'Program untuk membakar lemak sambil menjaga massa otot',
        bmiCategory: 'B2',
        bodyFatCategory: 'L3',
        cardioRatio: '60% Kardio - 40% Beban',
        dietRecommendation: 'Menjaga berat badan ideal dengan asupan kalori seimbang dan porsi lemak yang rendah dan tinggi protein.',
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
        code: 'P8',
        name: 'Body Recomposition Program',
        description: 'Program untuk mengubah komposisi tubuh dengan seimbang',
        bmiCategory: 'B3',
        bodyFatCategory: 'L2',
        cardioRatio: '50% Kardio - 50% Beban',
        dietRecommendation: 'Menjaga berat badan dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.',
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
        code: 'P9',
        name: 'Beginner Muscle Building Program',
        description: 'Program untuk pemula yang ingin menambah massa otot',
        bmiCategory: 'B1',
        bodyFatCategory: 'L3',
        cardioRatio: '35% Kardio - 65% Beban',
        dietRecommendation: 'Menambah berat badan dengan surplus kalori 300-500 kalori, tetap fokus pada peningkatan massa otot dengan asupan makanan tinggi protein dan rendah lemak.',
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
        code: 'P10',
        name: 'Advanced Strength Program',
        description: 'Program lanjutan untuk meningkatkan kekuatan dan massa otot',
        bmiCategory: 'B3',
        bodyFatCategory: 'L1',
        cardioRatio: '10% Kardio - 90% Beban',
        dietRecommendation: 'Menjaga berat badan dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.',
        schedule: {
          'Senin': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
          'Selasa': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
          'Rabu': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
          'Kamis': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
          'Jumat': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
          'Sabtu': '1. Squats: 3×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Standing Calf Raises: 3×6-8\n6. Seated Calf Raises: 2×10-15',
          'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
        }
      }
    ];

    // Create programs
    console.log('📝 Creating programs...');
    const createdPrograms = await Program.bulkCreate(programsData);
    console.log(`✅ Created ${createdPrograms.length} programs`);

    // Create rules for each program
    console.log('📏 Creating rules...');
    const rulesData = createdPrograms.map((program, index) => ({
      name: `Rule for ${program.name}`,
      description: `IF BMI = ${Program.getBMICategoryDisplay(program.bmiCategory)} AND Body Fat = ${Program.getBodyFatCategoryDisplay(program.bodyFatCategory)} THEN Program = ${program.code}`,
      bmiCategory: program.bmiCategory,
      bodyFatCategory: program.bodyFatCategory,
      programId: program.id,
      priority: index + 1,
      isActive: true
    }));

    const createdRules = await Rule.bulkCreate(rulesData);
    console.log(`✅ Created ${createdRules.length} rules`);

    console.log('🎉 Programs and rules seeded successfully!');
    
    return {
      programs: createdPrograms,
      rules: createdRules
    };

  } catch (error) {
    console.error('❌ Error seeding programs:', error);
    throw error;
  }
};

export default seedPrograms;