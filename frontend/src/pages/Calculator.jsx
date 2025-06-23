import { useState } from 'react';
import SidebarLayout from '../components/common/SidebarLayout';
import { useAuth } from '../contexts/AuthContext';
import { 
  FireIcon, 
  HeartIcon, 
  ScaleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

const Calculator = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calorie');

  // Calorie Calculator State
  const [calorieData, setCalorieData] = useState({
    age: '',
    weight: '',
    height: '',
    activityLevel: 'sedentary',
    goal: 'maintain'
  });

  // Body Fat Calculator State
  const [bodyFatData, setBodyFatData] = useState({
    weight: '',
    height: '',
    neck: '',
    waist: '',
    hip: '' // for women
  });

  const [calorieResult, setCalorieResult] = useState(null);
  const [bodyFatResult, setBodyFatResult] = useState(null);

  // Activity level multipliers
  const activityLevels = {
    sedentary: { value: 1.2, label: 'Tidak aktif (duduk sepanjang hari)' },
    light: { value: 1.375, label: 'Aktivitas ringan (olahraga 1-3x/minggu)' },
    moderate: { value: 1.55, label: 'Aktivitas sedang (olahraga 3-5x/minggu)' },
    active: { value: 1.725, label: 'Aktivitas tinggi (olahraga 6-7x/minggu)' },
    extreme: { value: 1.9, label: 'Aktivitas sangat tinggi (olahraga 2x/hari)' }
  };

  // Calculate BMR (Basal Metabolic Rate)
  const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  // Calculate daily calorie needs
  const calculateCalories = () => {
    const { age, weight, height, activityLevel, goal } = calorieData;
    
    if (!age || !weight || !height) {
      alert('Mohon lengkapi semua data!');
      return;
    }

    const bmr = calculateBMR(
      parseFloat(weight), 
      parseFloat(height), 
      parseInt(age), 
      user.gender
    );
    
    const dailyCalories = bmr * activityLevels[activityLevel].value;
    
    let targetCalories = dailyCalories;
    let recommendation = '';

    switch (goal) {
      case 'lose':
        targetCalories = dailyCalories - 500; // Deficit 500 kalori
        recommendation = 'Untuk menurunkan berat badan sekitar 0.5 kg per minggu';
        break;
      case 'gain':
        targetCalories = dailyCalories + 500; // Surplus 500 kalori
        recommendation = 'Untuk menambah berat badan sekitar 0.5 kg per minggu';
        break;
      default:
        recommendation = 'Untuk mempertahankan berat badan saat ini';
    }

    setCalorieResult({
      bmr: Math.round(bmr),
      dailyCalories: Math.round(dailyCalories),
      targetCalories: Math.round(targetCalories),
      recommendation
    });
  };

  // Calculate body fat percentage using US Navy method
  const calculateBodyFat = () => {
    const { weight, height, neck, waist, hip } = bodyFatData;
    
    if (!weight || !height || !neck || !waist) {
      alert('Mohon lengkapi semua data yang diperlukan!');
      return;
    }

    if (user.gender === 'female' && !hip) {
      alert('Data lingkar pinggul diperlukan untuk wanita!');
      return;
    }

    let bodyFatPercentage;

    if (user.gender === 'male') {
      // Formula untuk pria: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
      const logWaistNeck = Math.log10(parseFloat(waist) - parseFloat(neck));
      const logHeight = Math.log10(parseFloat(height));
      bodyFatPercentage = 495 / (1.0324 - 0.19077 * logWaistNeck + 0.15456 * logHeight) - 450;
    } else {
      // Formula untuk wanita: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
      const logWaistHipNeck = Math.log10(parseFloat(waist) + parseFloat(hip) - parseFloat(neck));
      const logHeight = Math.log10(parseFloat(height));
      bodyFatPercentage = 495 / (1.29579 - 0.35004 * logWaistHipNeck + 0.22100 * logHeight) - 450;
    }

    // Determine category
    let category = '';
    let categoryColor = '';
    
    if (user.gender === 'male') {
      if (bodyFatPercentage < 10) {
        category = 'Rendah';
        categoryColor = 'text-blue-600';
      } else if (bodyFatPercentage <= 20) {
        category = 'Normal';
        categoryColor = 'text-green-600';
      } else {
        category = 'Tinggi';
        categoryColor = 'text-red-600';
      }
    } else {
      if (bodyFatPercentage < 20) {
        category = 'Rendah';
        categoryColor = 'text-blue-600';
      } else if (bodyFatPercentage <= 30) {
        category = 'Normal';
        categoryColor = 'text-green-600';
      } else {
        category = 'Tinggi';
        categoryColor = 'text-red-600';
      }
    }

    setBodyFatResult({
      percentage: bodyFatPercentage.toFixed(1),
      category,
      categoryColor
    });
  };

  const handleCalorieChange = (e) => {
    const { name, value } = e.target;
    setCalorieData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBodyFatChange = (e) => {
    const { name, value } = e.target;
    setBodyFatData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
          Kalkulator Kesehatan
        </h1>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 lg:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('calorie')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'calorie'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FireIcon className="h-5 w-5 inline mr-2" />
                <span className="hidden sm:inline">Kalkulator </span>Kalori
              </button>
              <button
                onClick={() => setActiveTab('bodyFat')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'bodyFat'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ScaleIcon className="h-5 w-5 inline mr-2" />
                <span className="hidden sm:inline">Kalkulator </span>Body Fat
              </button>
            </nav>
          </div>
        </div>

        {/* Calorie Calculator Tab */}
        {activeTab === 'calorie' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Input Data Kalori
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Umur (tahun)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={calorieData.age}
                    onChange={handleCalorieChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan umur Anda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={calorieData.weight}
                    onChange={handleCalorieChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan berat badan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="height"
                    value={calorieData.height}
                    onChange={handleCalorieChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan tinggi badan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tingkat Aktivitas
                  </label>
                  <select
                    name="activityLevel"
                    value={calorieData.activityLevel}
                    onChange={handleCalorieChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(activityLevels).map(([key, level]) => (
                      <option key={key} value={key}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tujuan
                  </label>
                  <select
                    name="goal"
                    value={calorieData.goal}
                    onChange={handleCalorieChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lose">Menurunkan Berat Badan</option>
                    <option value="maintain">Mempertahankan Berat Badan</option>
                    <option value="gain">Menambah Berat Badan</option>
                  </select>
                </div>

                <button
                  onClick={calculateCalories}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Hitung Kalori
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hasil Perhitungan Kalori
              </h2>
              
              {calorieResult ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">BMR (Basal Metabolic Rate)</h3>
                    <p className="text-2xl font-bold text-blue-800">{calorieResult.bmr} kalori/hari</p>
                    <p className="text-sm text-blue-700">Kalori yang dibutuhkan untuk fungsi dasar tubuh</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-900 mb-2">Kebutuhan Kalori Harian</h3>
                    <p className="text-2xl font-bold text-green-800">{calorieResult.dailyCalories} kalori/hari</p>
                    <p className="text-sm text-green-700">Termasuk aktivitas fisik</p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-medium text-orange-900 mb-2">Target Kalori</h3>
                    <p className="text-2xl font-bold text-orange-800">{calorieResult.targetCalories} kalori/hari</p>
                    <p className="text-sm text-orange-700">{calorieResult.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FireIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Isi data di sebelah kiri untuk melihat hasil perhitungan kalori</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Body Fat Calculator Tab */}
        {activeTab === 'bodyFat' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Input Data Body Fat (Metode US Navy)
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={bodyFatData.weight}
                    onChange={handleBodyFatChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan berat badan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="height"
                    value={bodyFatData.height}
                    onChange={handleBodyFatChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan tinggi badan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lingkar Leher (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="neck"
                    value={bodyFatData.neck}
                    onChange={handleBodyFatChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ukur di bagian terkecil leher"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lingkar Pinggang (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="waist"
                    value={bodyFatData.waist}
                    onChange={handleBodyFatChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ukur di bagian terkecil pinggang"
                  />
                </div>

                {user.gender === 'female' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lingkar Pinggul (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="hip"
                      value={bodyFatData.hip}
                      onChange={handleBodyFatChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ukur di bagian terlebar pinggul"
                    />
                  </div>
                )}

                <button
                  onClick={calculateBodyFat}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Hitung Persentase Lemak
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Cara Mengukur:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Leher: di bagian terkecil, di bawah jakun</li>
                      <li>Pinggang: di bagian terkecil, biasanya di atas pusar</li>
                      {user.gender === 'female' && (
                        <li>Pinggul: di bagian terlebar pinggul</li>
                      )}
                      <li>Gunakan meteran yang tidak elastis</li>
                      <li>Jangan menarik meteran terlalu kencang</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hasil Perhitungan Body Fat
              </h2>
              
              {bodyFatResult ? (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-medium text-purple-900 mb-2">Persentase Lemak Tubuh</h3>
                    <p className="text-3xl font-bold text-purple-800">{bodyFatResult.percentage}%</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Kategori</h3>
                    <p className={`text-lg font-semibold ${bodyFatResult.categoryColor}`}>
                      {bodyFatResult.category}
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h3 className="font-medium text-yellow-900 mb-2">Referensi Kategori ({user.gender === 'male' ? 'Pria' : 'Wanita'})</h3>
                    <div className="text-sm text-yellow-800">
                      {user.gender === 'male' ? (
                        <ul className="space-y-1">
                          <li>• Rendah: &lt; 10%</li>
                          <li>• Normal: 10-20%</li>
                          <li>• Tinggi: &gt; 20%</li>
                        </ul>
                      ) : (
                        <ul className="space-y-1">
                          <li>• Rendah: &lt; 20%</li>
                          <li>• Normal: 20-30%</li>
                          <li>• Tinggi: &gt; 30%</li>
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      💡 <strong>Tip:</strong> Gunakan hasil ini untuk input pada halaman konsultasi program olahraga
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ScaleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Isi data di sebelah kiri untuk melihat hasil perhitungan persentase lemak</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Calculator;