import { useLocation, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/common/SidebarLayout';

const ConsultationResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  // If no result data, redirect to consultation
  if (!result) {
    navigate('/consultation');
    return null;
  }

  const getBMIDisplay = (bmiCategory) => {
    const mapping = {
      'B1': 'Underweight',
      'B2': 'Ideal', 
      'B3': 'Overweight',
      'B4': 'Obese'
    };
    return mapping[bmiCategory] || 'Unknown';
  };

  const getBodyFatDisplay = (bodyFatCategory) => {
    const mapping = {
      'L1': 'Rendah',
      'L2': 'Normal',
      'L3': 'Tinggi'
    };
    return mapping[bodyFatCategory] || 'Unknown';
  };

  // Program data based on the table you provided
  const programData = {
    'P1': {
      name: 'Program P1',
      schedule: {
        'Senin': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Selasa': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
        'Rabu': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Kamis': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15', 
        'Jumat': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
        'Sabtu': '1. Squats: 3×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Standing Calf Raises: 3×6-8\n6. Seated Calf Raises: 2×10-15',
        'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
      },
      cardioRatio: '10% Kardio - 90% Beban',
      diet: 'Fokus pada surplus kalori 300-500 kalori dengan makanan kaya protein dan karbohidrat untuk meningkatkan berat badan dan massa otot.'
    },
    'P2': {
      name: 'Program P2',
      schedule: {
        'Senin': '1. Squats: 3×6-8\n2. Bench Press: 3×6-8\n3. Seated Cable Rows: 3×8-10\n4. Dumbbell Shoulder Press: 3×8-10\n5. Lat Pull-Downs: 3×8-10\n6. Leg Curls: 3×8-10\n7. Triceps Pushdowns: 3×10-15\n8. Biceps Curls: 3×10-15',
        'Selasa': '1. Romanian Deadlift: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×6-8\n3. Incline Dumbbell Press: 3×8-10\n4. Chest Supported Rows: 3×8-10\n5. Leg Press: 3×10-12\n6. Lateral Raises: 3×10-15\n7. Face Pulls: 3×10-15\n8. Standing Calf Raises: 4×6-10',
        'Rabu': 'Cardio (Treadmill/Sepeda Statis)',
        'Kamis': '1. Squats: 3×6-8\n2. Bench Press: 3×6-8\n3. Seated Cable Rows: 3×8-10\n4. Dumbbell Shoulder Press: 3×8-10\n5. Lat Pull-Downs: 3×8-10\n6. Leg Curls: 3×8-10\n7. Triceps Pushdowns: 3×10-15\n8. Biceps Curls: 3×10-15',
        'Jumat': '1. Romanian Deadlift: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×6-8\n3. Incline Dumbbell Press: 3×8-10\n4. Chest Supported Rows: 3×8-10\n5. Leg Press: 3×10-12\n6. Lateral Raises: 3×10-15\n7. Face Pulls: 3×10-15\n8. Standing Calf Raises: 4×6-10',
        'Sabtu': 'Cardio (Treadmill/Sepeda Statis)',
        'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
      },
      cardioRatio: '40% Kardio - 60% Beban',
      diet: 'Menjaga berat badan ideal dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.'
    },
    'P3': {
      name: 'Program P3',
      schedule: {
        'Senin': '1. Bench Press: 3×6-8\n2. Rows: 3×6-8\n3. Shoulder Press: 3×8-10\n4. Pull-Ups: 3×8-10\n5. Incline Dumbbell Flyes: 2×10-15\n6. Dumbbell Curls: 2×12-15\n7. Triceps Extensions: 2×12-15',
        'Selasa': 'Cardio (Treadmill/Sepeda Statis)',
        'Rabu': '1. Squats: 3×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Standing Calf Raises: 4×6-8',
        'Kamis': 'Cardio (Treadmill/Sepeda Statis)',
        'Jumat': '1. Bench Press: 3×6-8\n2. Rows: 3×6-8\n3. Shoulder Press: 3×8-10\n4. Pull-Ups: 3×8-10\n5. Incline Dumbbell Flyes: 2×10-15\n6. Dumbbell Curls: 2×12-15\n7. Triceps Extensions: 2×12-15',
        'Sabtu': 'Cardio (Treadmill/Sepeda Statis)',
        'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
      },
      cardioRatio: '70% Kardio - 30% Beban',
      diet: 'Menurunkan berat badan dengan defisit kalori 300-500 kalori melalui konsumsi protein tinggi dan pengurangan karbohidrat sederhana.'
    },
    'P4': {
      name: 'Program P4',
      schedule: {
        'Senin': '1. Bench Press: 3×6-8\n2. Rows: 3×6-8\n3. Shoulder Press: 3×8-10\n4. Pull-Ups: 3×8-10\n5. Incline Dumbbell Flyes: 2×10-15\n6. Dumbbell Curls: 2×12-15\n7. Triceps Extensions: 2×12-15',
        'Selasa': 'Cardio (Treadmill/Sepeda Statis)',
        'Rabu': 'Cardio (Treadmill/Sepeda Statis)',
        'Kamis': '1. Squats: 3×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Standing Calf Raises: 4×6-8',
        'Jumat': 'Cardio (Treadmill/Sepeda Statis)',
        'Sabtu': 'Cardio (Treadmill/Sepeda Statis)',
        'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
      },
      cardioRatio: '80% Kardio - 20% Beban',
      diet: 'Mengurangi berat badan secara signifikan dengan defisit kalori 500-700 kalori, mengutamakan makanan rendah kalori dan tinggi protein.'
    },
    'P5': {
      name: 'Program P5',
      schedule: {
        'Senin': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Selasa': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
        'Rabu': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Kamis': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Jumat': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
        'Sabtu': '1. Squats: 3×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Standing Calf Raises: 3×6-8\n6. Seated Calf Raises: 2×10-15',
        'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
      },
      cardioRatio: '20% Kardio - 80% Beban',
      diet: 'Menambah berat badan dengan surplus kalori 300-500 kalori melalui makanan bergizi tinggi dan kaya protein tanpa menambah lemak berlebih.'
    },
    'P6': {
      name: 'Program P6',
      schedule: {
        'Senin': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Selasa': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
        'Rabu': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Kamis': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Jumat': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
        'Sabtu': '1. Squats: 3×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Standing Calf Raises: 3×6-8\n6. Seated Calf Raises: 2×10-15',
        'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
      },
      cardioRatio: '15% Kardio - 85% Beban',
      diet: 'Menjaga berat badan ideal dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.'
    },
    'P7': {
      name: 'Program P7',
      schedule: {
        'Senin': '1. Squats: 3×6-8\n2. Bench Press: 3×6-8\n3. Seated Cable Rows: 3×8-10\n4. Dumbbell Shoulder Press: 3×8-10\n5. Lat Pull-Downs: 3×8-10\n6. Leg Curls: 3×8-10\n7. Triceps Pushdowns: 3×10-15\n8. Biceps Curls: 3×10-15',
        'Selasa': '1. Romanian Deadlift: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×6-8\n3. Incline Dumbbell Press: 3×8-10\n4. Chest Supported Rows: 3×8-10\n5. Leg Press: 3×10-12\n6. Lateral Raises: 3×10-15\n7. Face Pulls: 3×10-15\n8. Standing Calf Raises: 4×6-10',
        'Rabu': 'Cardio (Treadmill/Sepeda Statis)',
        'Kamis': '1. Squats: 3×6-8\n2. Bench Press: 3×6-8\n3. Seated Cable Rows: 3×8-10\n4. Dumbbell Shoulder Press: 3×8-10\n5. Lat Pull-Downs: 3×8-10\n6. Leg Curls: 3×8-10\n7. Triceps Pushdowns: 3×10-15\n8. Biceps Curls: 3×10-15',
        'Jumat': '1. Romanian Deadlift: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×6-8\n3. Incline Dumbbell Press: 3×8-10\n4. Chest Supported Rows: 3×8-10\n5. Leg Press: 3×10-12\n6. Lateral Raises: 3×10-15\n7. Face Pulls: 3×10-15\n8. Standing Calf Raises: 4×6-10',
        'Sabtu': 'Cardio (Treadmill/Sepeda Statis)',
        'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
      },
      cardioRatio: '60% Kardio - 40% Beban',
      diet: 'Menjaga berat badan ideal dengan asupan kalori seimbang dan porsi lemak yang rendah dan tinggi protein.'
    },
    'P8': {
      name: 'Program P8',
      schedule: {
        'Senin': '1. Squats: 3×6-8\n2. Bench Press: 3×6-8\n3. Seated Cable Rows: 3×8-10\n4. Dumbbell Shoulder Press: 3×8-10\n5. Lat Pull-Downs: 3×8-10\n6. Leg Curls: 3×8-10\n7. Triceps Pushdowns: 3×10-15\n8. Biceps Curls: 3×10-15',
        'Selasa': '1. Romanian Deadlift: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×6-8\n3. Incline Dumbbell Press: 3×8-10\n4. Chest Supported Rows: 3×8-10\n5. Leg Press: 3×10-12\n6. Lateral Raises: 3×10-15\n7. Face Pulls: 3×10-15\n8. Standing Calf Raises: 4×6-10',
        'Rabu': 'Cardio (Treadmill/Sepeda Statis)',
        'Kamis': '1. Squats: 3×6-8\n2. Bench Press: 3×6-8\n3. Seated Cable Rows: 3×8-10\n4. Dumbbell Shoulder Press: 3×8-10\n5. Lat Pull-Downs: 3×8-10\n6. Leg Curls: 3×8-10\n7. Triceps Pushdowns: 3×10-15\n8. Biceps Curls: 3×10-15',
        'Jumat': '1. Romanian Deadlift: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×6-8\n3. Incline Dumbbell Press: 3×8-10\n4. Chest Supported Rows: 3×8-10\n5. Leg Press: 3×10-12\n6. Lateral Raises: 3×10-15\n7. Face Pulls: 3×10-15\n8. Standing Calf Raises: 4×6-10',
        'Sabtu': 'Cardio (Treadmill/Sepeda Statis)',
        'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
      },
      cardioRatio: '40% Kardio - 60% Beban',
      diet: 'Menjaga berat badan dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.'
    },
    'P9': {
      name: 'Program P9',
      schedule: {
        'Senin': '1. Squats: 3×6-8\n2. Bench Press: 3×6-8\n3. Seated Cable Rows: 3×8-10\n4. Dumbbell Shoulder Press: 3×8-10\n5. Lat Pull-Downs: 3×8-10\n6. Leg Curls: 3×8-10\n7. Triceps Pushdowns: 3×10-15\n8. Biceps Curls: 3×10-15',
        'Selasa': '1. Romanian Deadlift: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×6-8\n3. Incline Dumbbell Press: 3×8-10\n4. Chest Supported Rows: 3×8-10\n5. Leg Press: 3×10-12\n6. Lateral Raises: 3×10-15\n7. Face Pulls: 3×10-15\n8. Standing Calf Raises: 4×6-10',
        'Rabu': 'Cardio (Treadmill/Sepeda Statis)',
        'Kamis': '1. Squats: 3×6-8\n2. Bench Press: 3×6-8\n3. Seated Cable Rows: 3×8-10\n4. Dumbbell Shoulder Press: 3×8-10\n5. Lat Pull-Downs: 3×8-10\n6. Leg Curls: 3×8-10\n7. Triceps Pushdowns: 3×10-15\n8. Biceps Curls: 3×10-15',
        'Jumat': '1. Romanian Deadlift: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×6-8\n3. Incline Dumbbell Press: 3×8-10\n4. Chest Supported Rows: 3×8-10\n5. Leg Press: 3×10-12\n6. Lateral Raises: 3×10-15\n7. Face Pulls: 3×10-15\n8. Standing Calf Raises: 4×6-10',
        'Sabtu': 'Cardio (Treadmill/Sepeda Statis)',
        'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
      },
      cardioRatio: '35% Kardio - 65% Beban',
      diet: 'Menambah berat badan dengan surplus kalori 300-500 kalori, tetap fokus pada peningkatan massa otot dengan asupan makanan tinggi protein dan rendah lemak.'
    },
    'P10': {
      name: 'Program P10',
      schedule: {
        'Senin': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Selasa': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
        'Rabu': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Kamis': '1. Bench Press: 3×6-8\n2. Shoulder Press: 3×8-10\n3. Incline Dumbbell Flyes: 3×10-15\n4. Triceps Pushdowns: 3×10-15',
        'Jumat': '1. Rows: 3×6-8\n2. Pull-Ups or Lat Pull-Downs: 3×8-10\n3. Face Pulls: 3×10-15\n4. Barbell Shrugs: 3×8-10\n5. Dumbbell Curls: 3×10-15',
        'Sabtu': '1. Squats: 3×6-8\n2. Romanian Deadlifts: 3×6-8\n3. Leg Press: 3×8-10\n4. Leg Curls: 3×8-10\n5. Standing Calf Raises: 3×6-8\n6. Seated Calf Raises: 2×10-15',
        'Minggu': 'Rest/Cardio (Treadmill/Sepeda Statis)'
      },
      cardioRatio: '10% Kardio - 90% Beban',
      diet: 'Menjaga berat badan dengan konsumsi kalori seimbang antara protein, lemak sehat, dan karbohidrat kompleks.'
    }
  };

  const currentProgram = programData[result.programCode] || programData['P2'];

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
          Hasil Konsultasi
        </h1>
        
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama: <span className="font-medium text-gray-900">{result.user}</span></p>
              <p className="text-sm text-gray-600">BMI: <span className="font-medium text-gray-900">{getBMIDisplay(result.bmiCategory)}</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Persentase Lemak: <span className="font-medium text-gray-900">{getBodyFatDisplay(result.bodyFatCategory)}</span></p>
            </div>
          </div>
        </div>

        {/* Program Schedule */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Program Latihan</h2>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hari
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gerakan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(currentProgram.schedule).map(([day, exercise]) => (
                  <tr key={day}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {day}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="whitespace-pre-line">{exercise}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {Object.entries(currentProgram.schedule).map(([day, exercise]) => (
              <div key={day} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{day}</h3>
                </div>
                <div className="text-sm text-gray-600 whitespace-pre-line">{exercise}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
          {/* Cardio Ratio */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Rasio Latihan</h3>
            <p className="text-sm text-blue-800">{currentProgram.cardioRatio}</p>
          </div>

          {/* Diet Recommendation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Rekomendasi Diet</h3>
            <p className="text-sm text-green-800">{currentProgram.diet}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/consultation')}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 text-center"
          >
            Simpan
          </button>
          
          <button
            onClick={() => navigate('/consultation')}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-center"
          >
            Ulangi Konsultasi
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ConsultationResult;