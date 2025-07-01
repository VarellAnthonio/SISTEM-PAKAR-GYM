import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/common/SidebarLayout';
import { useAuth } from '../contexts/AuthContext';

const Consultation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    bodyFatPercentage: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.weight) {
      newErrors.weight = 'Berat badan harus diisi';
    } else if (formData.weight <= 0 || formData.weight > 300) {
      newErrors.weight = 'Berat badan tidak valid (1-300 kg)';
    }

    if (!formData.height) {
      newErrors.height = 'Tinggi badan harus diisi';
    } else if (formData.height <= 0 || formData.height > 250) {
      newErrors.height = 'Tinggi badan tidak valid (1-250 cm)';
    }

    if (!formData.bodyFatPercentage) {
      newErrors.bodyFatPercentage = 'Persentase lemak tubuh harus diisi';
    } else if (formData.bodyFatPercentage <= 0 || formData.bodyFatPercentage > 50) {
      newErrors.bodyFatPercentage = 'Persentase lemak tidak valid (1-50%)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'B1'; // Underweight
    if (bmi >= 18.5 && bmi <= 24.9) return 'B2'; // Ideal
    if (bmi >= 25 && bmi <= 29.9) return 'B3'; // Overweight
    return 'B4'; // Obese
  };

  const getBodyFatCategory = (bodyFat, gender) => {
    if (gender === 'male') {
      if (bodyFat < 10) return 'L1'; // Rendah
      if (bodyFat >= 10 && bodyFat <= 20) return 'L2'; // Normal
      return 'L3'; // Tinggi
    } else {
      if (bodyFat < 20) return 'L1'; // Rendah
      if (bodyFat >= 20 && bodyFat <= 30) return 'L2'; // Normal
      return 'L3'; // Tinggi
    }
  };

  // COMPLETE P1-P10 FORWARD CHAINING MAPPING
  const getProgramCode = (bmiCategory, bodyFatCategory) => {
    const mapping = {
      'B1-L1': 'P1', // Underweight + Rendah → Fat Loss Program
      'B2-L2': 'P2', // Ideal + Normal → Muscle Gain Program
      'B3-L3': 'P3', // Overweight + Tinggi → Weight Loss Program
      'B4-L3': 'P4', // Obese + Tinggi → Extreme Weight Loss Program
      'B1-L2': 'P5', // Underweight + Normal → Lean Muscle Program
      'B2-L1': 'P6', // Ideal + Rendah → Strength & Definition Program
      'B2-L3': 'P7', // Ideal + Tinggi → Fat Burning & Toning Program
      'B3-L2': 'P8', // Overweight + Normal → Body Recomposition Program
      'B1-L3': 'P9', // Underweight + Tinggi → Beginner Muscle Building Program
      'B3-L1': 'P10' // Overweight + Rendah → Advanced Strength Program
    };
    
    const key = `${bmiCategory}-${bodyFatCategory}`;
    return mapping[key] || 'P2'; // Default to P2 if no exact match
  };

  // Get program name for display
  const getProgramName = (programCode) => {
    const programNames = {
      'P1': 'Fat Loss Program',
      'P2': 'Muscle Gain Program',
      'P3': 'Weight Loss Program',
      'P4': 'Extreme Weight Loss Program',
      'P5': 'Lean Muscle Program',
      'P6': 'Strength & Definition Program',
      'P7': 'Fat Burning & Toning Program',
      'P8': 'Body Recomposition Program',
      'P9': 'Beginner Muscle Building Program',
      'P10': 'Advanced Strength Program'
    };
    return programNames[programCode] || 'Default Program';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Calculate BMI and determine categories
      const bmi = calculateBMI(parseFloat(formData.weight), parseFloat(formData.height));
      const bmiCategory = getBMICategory(bmi);
      const bodyFatCategory = getBodyFatCategory(parseFloat(formData.bodyFatPercentage), user.gender);
      const programCode = getProgramCode(bmiCategory, bodyFatCategory);
      const programName = getProgramName(programCode);
      
      // Create consultation result
      const consultationResult = {
        user: user.name,
        weight: formData.weight,
        height: formData.height,
        bodyFatPercentage: formData.bodyFatPercentage,
        bmi: bmi.toFixed(1),
        bmiCategory,
        bodyFatCategory,
        programCode,
        programName,
        timestamp: new Date().toISOString()
      };
      
      console.log('Forward Chaining Result:', {
        input: {
          bmi: bmi.toFixed(1),
          bodyFat: formData.bodyFatPercentage,
          gender: user.gender
        },
        categories: {
          bmi: bmiCategory,
          bodyFat: bodyFatCategory
        },
        result: {
          program: programCode,
          name: programName
        }
      });
      
      // Navigate to results page with data
      navigate('/consultation/result', { 
        state: { result: consultationResult } 
      });
      
    } catch (error) {
      console.error('Consultation error:', error);
      setErrors({ general: 'Terjadi kesalahan dalam proses konsultasi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Isi Data Konsultasi
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Berat Badan */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                Berat Badan (kg):
              </label>
              <input
                type="number"
                step="0.1"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.weight ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Masukkan berat badan Anda"
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
              )}
            </div>

            {/* Tinggi Badan */}
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                Tinggi Badan (cm):
              </label>
              <input
                type="number"
                step="0.1"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.height ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Masukkan tinggi badan Anda"
              />
              {errors.height && (
                <p className="mt-1 text-sm text-red-600">{errors.height}</p>
              )}
            </div>

            {/* Persentase Lemak */}
            <div>
              <label htmlFor="bodyFatPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                Persentase Lemak (%):
              </label>
              <input
                type="number"
                step="0.1"
                id="bodyFatPercentage"
                name="bodyFatPercentage"
                value={formData.bodyFatPercentage}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.bodyFatPercentage ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Masukkan persentase lemak tubuh Anda"
              />
              {errors.bodyFatPercentage && (
                <p className="mt-1 text-sm text-red-600">{errors.bodyFatPercentage}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Memproses...' : 'Konsultasi'}
              </button>
            </div>
          </form>
        </div>

        {/* Forward Chaining Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Sistem Forward Chaining:</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Sistem akan menganalisis BMI dan persentase lemak tubuh Anda</p>
            <p>• Forward chaining akan menentukan program yang tepat dari P1-P10</p>
            <p>• Program disesuaikan dengan gender ({user.gender === 'male' ? 'Pria' : 'Wanita'})</p>
          </div>
        </div>

        {/* Program Categories Info */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Program yang Tersedia:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-800">
            <div>
              <p>• P1: Fat Loss Program</p>
              <p>• P2: Muscle Gain Program</p>
              <p>• P3: Weight Loss Program</p>
              <p>• P4: Extreme Weight Loss</p>
              <p>• P5: Lean Muscle Program</p>
            </div>
            <div>
              <p>• P6: Strength & Definition</p>
              <p>• P7: Fat Burning & Toning</p>
              <p>• P8: Body Recomposition</p>
              <p>• P9: Beginner Muscle Building</p>
              <p>• P10: Advanced Strength</p>
            </div>
          </div>
        </div>

        {/* Body Fat Reference */}
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-900 mb-2">
            Referensi Persentase Lemak ({user.gender === 'male' ? 'Pria' : 'Wanita'}):
          </h3>
          <div className="text-sm text-purple-800">
            {user.gender === 'male' ? (
              <div className="space-y-1">
                <p>• Rendah (L1): &lt; 10%</p>
                <p>• Normal (L2): 10-20%</p>
                <p>• Tinggi (L3): &gt; 20%</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p>• Rendah (L1): &lt; 20%</p>
                <p>• Normal (L2): 20-30%</p>
                <p>• Tinggi (L3): &gt; 30%</p>
              </div>
            )}
          </div>
        </div>

        {/* Tips Box */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Tips untuk Hasil Optimal:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Pastikan data yang dimasukkan akurat</li>
            <li>• Ukur persentase lemak tubuh menggunakan alat yang tepat</li>
            <li>• Konsultasi dilakukan sebaiknya di pagi hari setelah bangun tidur</li>
            <li>• Gunakan kalkulator kesehatan jika belum tahu persentase lemak tubuh</li>
            <li>• Konsistensi pengukuran akan memberikan hasil yang lebih baik</li>
          </ul>
        </div>

        {/* Quick Link to Calculator */}
        <div className="mt-4">
          <button
            onClick={() => navigate('/calculator')}
            className="w-full px-4 py-2 bg-green-100 border border-green-300 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200"
          >
            💡 Belum tahu persentase lemak tubuh? Gunakan Kalkulator Kesehatan
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Consultation;