import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import { Exercise } from '../models/index.js';

dotenv.config();

const seedExercises = async () => {
  try {
    console.log('🏋️ Starting to seed exercises...');

    // Clear existing exercises
    await Exercise.destroy({ where: {} });

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

    // Create exercises
    console.log('📝 Creating exercises...');
    const createdExercises = await Exercise.bulkCreate(exercisesData);
    console.log(`✅ Created ${createdExercises.length} exercises`);

    // Log statistics
    const stats = {};
    createdExercises.forEach(exercise => {
      stats[exercise.category] = (stats[exercise.category] || 0) + 1;
    });

    console.log('📊 Exercise statistics by category:');
    Object.entries(stats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} exercises`);
    });

    console.log('🎉 Exercises seeded successfully!');
    
    return createdExercises;

  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    throw error;
  }
};

export default seedExercises;