// backend/seeds/seedExercises.js
import dotenv from 'dotenv';
import sequelize, { testConnection } from '../config/database.js';
import { Exercise } from '../models/index.js';

dotenv.config();

const seedExercises = async () => {
  try {
    console.log('🏋️ Starting exercise seeding with real YouTube URLs...\n');

    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Clear existing exercises
    await Exercise.destroy({ where: {} });
    console.log('🗑️ Cleared existing exercises');

    // Exercise data with real YouTube URLs for fitness demonstrations
    const exercisesData = [
      // PUSH EXERCISES
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
        tags: ['bodyweight', 'push', 'chest', 'beginner']
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
        tags: ['compound', 'strength', 'chest', 'barbell']
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
        tags: ['shoulders', 'overhead', 'dumbbell', 'strength']
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
        tags: ['bodyweight', 'triceps', 'chest', 'intermediate']
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
        tags: ['bodyweight', 'back', 'biceps', 'advanced']
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
        tags: ['compound', 'back', 'rowing', 'strength']
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
        tags: ['machine', 'back', 'lats', 'beginner']
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
        tags: ['isolation', 'biceps', 'arms', 'dumbbell']
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
        tags: ['compound', 'legs', 'strength', 'functional']
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
        tags: ['unilateral', 'legs', 'balance', 'functional']
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
        tags: ['compound', 'posterior-chain', 'strength', 'deadlift']
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
        tags: ['isolation', 'calves', 'legs', 'simple']
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
        tags: ['full-body', 'cardio', 'conditioning', 'hiit']
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
        tags: ['cardio', 'core', 'dynamic', 'conditioning']
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
        tags: ['core', 'isometric', 'stability', 'beginner']
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
        tags: ['complex', 'mobility', 'strength', 'functional']
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
        tags: ['hiit', 'cardio', 'fat-burning', 'conditioning']
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
        tags: ['cardio', 'coordination', 'portable', 'endurance']
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
        tags: ['running', 'endurance', 'outdoor', 'technique']
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
        tags: ['cycling', 'low-impact', 'endurance', 'cardio']
      }
    ];

    // Bulk create exercises
    const exercises = await Exercise.bulkCreate(exercisesData, {
      validate: true,
      individualHooks: true // This will trigger the beforeCreate hook for YouTube video ID extraction
    });

    console.log(`✅ Successfully created ${exercises.length} exercises with YouTube integration`);

    // Display summary by category
    const categoryStats = await Exercise.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      order: [['category', 'ASC']]
    });

    console.log('\n📊 Exercise Distribution:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.get('count')} exercises`);
    });

    // Count exercises with YouTube videos
    const withYouTube = await Exercise.count({
      where: {
        youtubeUrl: { [sequelize.Sequelize.Op.ne]: null }
      }
    });

    console.log(`\n🎥 YouTube Integration: ${withYouTube}/${exercises.length} exercises have YouTube videos`);

    // Display difficulty distribution
    const difficultyStats = await Exercise.findAll({
      attributes: [
        'difficulty',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['difficulty'],
      order: [['difficulty', 'ASC']]
    });

    console.log('\n🎯 Difficulty Distribution:');
    difficultyStats.forEach(stat => {
      console.log(`   ${stat.difficulty}: ${stat.get('count')} exercises`);
    });

    console.log('\n✅ Exercise seeding completed successfully!');
    console.log('\n🎬 All exercises include real YouTube demonstration videos');
    console.log('💡 Ready for integration with fitness programs P1-P10');

  } catch (error) {
    console.error('❌ Exercise seeding failed:', error);
    throw error;
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedExercises()
    .then(() => {
      console.log('\n🎉 Exercise seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Exercise seeding process failed:', error);
      process.exit(1);
    });
}

export default seedExercises;