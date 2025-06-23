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

  const getProgramCode = (bmiCategory, bodyFatCategory) => {
    const mapping = {
      'B1-L1': 'P1', // Underweight + Rendah
      'B2-L2': 'P2', // Ideal + Normal
      'B3-L3': 'P3', // Overweight + Tinggi
      'B4-L3': 'P4', // Obese + Tinggi
      'B1-L2': 'P5', // Underweight + Normal
      'B2-L1': 'P6', // Ideal + Rendah
      'B2-L3': 'P7', // Ideal + Tinggi
      'B3-L2': 'P8', // Overweight + Normal
      'B1-L3': 'P9', // Underweight + Tinggi
      'B3-L1': 'P10' // Overweight + Rendah
    };
    
    return mapping[`${bmiCategory}-${bodyFatCategory}`] || 'P2'; // Default to P2
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
      
      // For now, we'll navigate to results page with data
      // Later this will be an API call
      const consultationResult = {
        user: user.name,
        weight: formData.weight,
        height: formData.height,
        bodyFatPercentage: formData.bodyFatPercentage,
        bmi: bmi.toFixed(1),
        bmiCategory,
        bodyFatCategory,
        programCode,
        timestamp: new Date().toISOString()
      };
      
      // Navigate to results page with data
      navigate('/consultation/result', { 
        state: { result: consultationResult } 
      });
      
    } catch (error) {
      console.error('Consultation error:', error);
      // Handle error - show toast or error message
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

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Informasi:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Pastikan data yang dimasukkan akurat untuk hasil yang optimal</li>
            <li>• Persentase lemak tubuh dapat diukur menggunakan alat body fat analyzer</li>
            <li>• Konsultasi dengan ahli gizi jika memerlukan panduan lebih lanjut</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Consultation;