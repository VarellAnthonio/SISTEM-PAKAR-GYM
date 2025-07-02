import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/common/SidebarLayout';
import { useAuth } from '../contexts/AuthContext';
import { consultationService } from '../services/consultation';
import toast from 'react-hot-toast';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Send consultation data to backend for forward chaining
      const consultationData = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        bodyFatPercentage: parseFloat(formData.bodyFatPercentage),
        notes: 'Konsultasi program olahraga'
      };

      console.log('Sending consultation data to backend:', consultationData);
      
      // Call backend API for forward chaining
      const result = await consultationService.create(consultationData);
      
      if (result.success) {
        console.log('Backend forward chaining result:', result.data);
        
        // Prepare consultation result for display
        const consultationResult = {
          user: user.name,
          weight: formData.weight,
          height: formData.height,
          bodyFatPercentage: formData.bodyFatPercentage,
          bmi: result.data.bmi,
          bmiCategory: result.data.bmiCategory,
          bodyFatCategory: result.data.bodyFatCategory,
          programCode: result.data.program?.code,
          programName: result.data.program?.name,
          timestamp: new Date().toISOString(),
          consultationId: result.data.id
        };
        
        console.log('Navigating to results with:', consultationResult);
        
        toast.success('Konsultasi berhasil! Program telah ditentukan.');
        
        // Navigate to results page with real data from backend
        navigate('/consultation/result', { 
          state: { result: consultationResult } 
        });
        
      } else {
        throw new Error(result.message || 'Konsultasi gagal');
      }
      
    } catch (error) {
      console.error('Consultation error:', error);
      
      // Show user-friendly error message
      if (error.message.includes('Network')) {
        setErrors({ general: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' });
      } else if (error.message.includes('forward chaining')) {
        setErrors({ general: 'Sistem forward chaining mengalami masalah. Silakan coba lagi.' });
      } else {
        setErrors({ general: error.message || 'Terjadi kesalahan dalam proses konsultasi' });
      }
      
      toast.error('Konsultasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Konsultasi Program Olahraga
        </h1>
        
        {/* System Info */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Sistem Forward Chaining</h3>
          <p className="text-sm text-blue-800">
            Data Anda akan diproses menggunakan sistem forward chaining di backend untuk menentukan program yang tepat dari P1-P10 berdasarkan kondisi BMI dan persentase lemak tubuh.
          </p>
        </div>
        
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses Forward Chaining...
                  </>
                ) : (
                  'Mulai Konsultasi'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Process Explanation */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Proses Forward Chaining:</h3>
          <div className="text-sm text-green-800 space-y-1">
            <p>1. Sistem menghitung BMI dari berat dan tinggi badan Anda</p>
            <p>2. Menentukan kategori BMI (B1: Underweight, B2: Ideal, B3: Overweight, B4: Obese)</p>
            <p>3. Menentukan kategori lemak tubuh berdasarkan gender ({user.gender === 'male' ? 'Pria' : 'Wanita'})</p>
            <p>4. Forward chaining engine memilih program optimal dari P1-P10</p>
            <p>5. Menampilkan jadwal latihan yang telah diedit admin (real-time dari database)</p>
          </div>
        </div>

        {/* Program Categories Info */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Program yang Tersedia:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
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
            <li>• Jadwal yang ditampilkan adalah hasil edit admin terbaru (real-time)</li>
          </ul>
        </div>

        {/* Quick Link to Calculator */}
        <div className="mt-4">
          <button
            onClick={() => navigate('/calculator')}
            className="w-full px-4 py-2 bg-green-100 border border-green-300 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200"
            disabled={loading}
          >
            💡 Belum tahu persentase lemak tubuh? Gunakan Kalkulator Kesehatan
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Consultation;