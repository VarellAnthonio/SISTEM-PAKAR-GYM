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
    bodyFatPercentage: '' // ← Starts empty, user can leave it empty
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

  // 🔄 UPDATED: Validation with optional body fat
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

    // 🔄 NEW: Optional validation for body fat
    if (formData.bodyFatPercentage && (formData.bodyFatPercentage <= 0 || formData.bodyFatPercentage > 50)) {
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
      // 🔄 UPDATED: Handle both BMI-only and full consultation
      const consultationData = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        // Only include bodyFatPercentage if it's provided
        ...(formData.bodyFatPercentage && { 
          bodyFatPercentage: parseFloat(formData.bodyFatPercentage) 
        }),
        notes: formData.bodyFatPercentage ? 
          'Konsultasi lengkap dengan BMI dan Body Fat' : 
          'Konsultasi BMI saja'
      };

      console.log('Sending consultation data to backend:', consultationData);
      
      // Call backend API for forward chaining
      const result = await consultationService.create(consultationData);
      
      if (result.success) {
        console.log('Backend forward chaining result:', result.data);
        
        // 🔄 UPDATED: Handle both consultation types in result
        const consultationResult = {
          user: user.name,
          weight: formData.weight,
          height: formData.height,
          bodyFatPercentage: formData.bodyFatPercentage || null, // ← Can be null
          bmi: result.data.bmi,
          bmiCategory: result.data.bmiCategory,
          bodyFatCategory: result.data.bodyFatCategory, // ← Can be null
          programCode: result.data.program?.code,
          programName: result.data.program?.name,
          timestamp: new Date().toISOString(),
          consultationId: result.data.id,
          isBMIOnly: result.data.isBMIOnly || !formData.bodyFatPercentage // ← New flag
        };
        
        console.log('Navigating to results with:', consultationResult);
        
        const successMessage = formData.bodyFatPercentage ? 
          'Konsultasi lengkap berhasil! Program ditentukan berdasarkan BMI dan Body Fat.' :
          'Konsultasi BMI berhasil! Program ditentukan berdasarkan BMI saja.';
        
        toast.success(successMessage);
        
        // Navigate to results page
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
        
        {/* 🔄 UPDATED: System Info with BMI-only option */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Sistem Forward Chaining</h3>
          <p className="text-sm text-blue-800 mb-2">
            Data Anda akan diproses menggunakan sistem forward chaining di backend untuk menentukan program yang tepat.
          </p>
          <div className="text-xs text-blue-700 bg-blue-100 rounded p-2">
            <strong>2 Mode Konsultasi:</strong>
            <br />• <strong>BMI saja:</strong> B1→P1, B2→P2, B3→P3, B4→P4
            <br />• <strong>BMI + Body Fat:</strong> 10 kombinasi lengkap untuk rekomendasi optimal
          </div>
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
                Berat Badan (kg) *:
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
                required
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
              )}
            </div>

            {/* Tinggi Badan */}
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                Tinggi Badan (cm) *:
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
                required
              />
              {errors.height && (
                <p className="mt-1 text-sm text-red-600">{errors.height}</p>
              )}
            </div>

            {/* 🔄 UPDATED: Persentase Lemak - Now OPTIONAL */}
            <div>
              <label htmlFor="bodyFatPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                Persentase Lemak (%) - <span className="text-green-600 font-medium">Opsional</span>:
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
                placeholder="Kosongkan jika tidak tahu (opsional)"
                disabled={loading}
              />
              {errors.bodyFatPercentage && (
                <p className="mt-1 text-sm text-red-600">{errors.bodyFatPercentage}</p>
              )}
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>💡 Tips:</strong>
                </p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  <li>• <strong>Jika diisi:</strong> Sistem akan memberikan rekomendasi program yang sangat spesifik (10 kombinasi)</li>
                  <li>• <strong>Jika dikosongkan:</strong> Sistem akan menggunakan BMI saja untuk rekomendasi dasar</li>
                  <li>• Gunakan kalkulator kesehatan jika belum tahu persentase lemak tubuh</li>
                </ul>
              </div>
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
                    {formData.bodyFatPercentage ? 
                      'Memproses Konsultasi Lengkap...' : 
                      'Memproses Konsultasi BMI...'}
                  </>
                ) : (
                  <>
                    {formData.bodyFatPercentage ? 
                      '🔬 Mulai Konsultasi Lengkap (BMI + Body Fat)' : 
                      '📊 Mulai Konsultasi BMI Saja'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 🔄 UPDATED: Tips Box with BMI-only information */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Tips untuk Hasil Optimal:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <strong>Konsultasi BMI saja:</strong> Cepat dan mudah, rekomendasi program dasar</li>
            <li>• <strong>Konsultasi lengkap:</strong> Lebih akurat dengan 10 program spesifik</li>
            <li>• Pastikan data berat dan tinggi badan akurat</li>
            <li>• Konsultasi dilakukan sebaiknya di pagi hari setelah bangun tidur</li>
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