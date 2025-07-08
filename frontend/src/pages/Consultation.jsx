import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/common/SidebarLayout';
import { useAuth } from '../contexts/AuthContext';
import { consultationService } from '../services/consultation';
import toast from 'react-hot-toast';
import { 
  ClipboardDocumentListIcon, 
  CalculatorIcon,
  InformationCircleIcon,
  ScaleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Consultation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [consultationType, setConsultationType] = useState('simple'); // 'simple' or 'complete'
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

    if (consultationType === 'complete' && formData.bodyFatPercentage && 
        (formData.bodyFatPercentage <= 0 || formData.bodyFatPercentage > 50)) {
      newErrors.bodyFatPercentage = 'Persentase lemak tidak valid (1-50%)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBMI = () => {
    if (formData.weight && formData.height) {
      const bmi = formData.weight / Math.pow(formData.height / 100, 2);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi >= 18.5 && bmi <= 24.9) return 'Ideal';
    if (bmi >= 25 && bmi <= 29.9) return 'Overweight';
    return 'Obese';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const consultationData = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        notes: consultationType === 'complete' ? 
          'Konsultasi lengkap dengan BMI dan Body Fat' : 
          'Konsultasi BMI saja'
      };

      // Include body fat only if complete consultation and value provided
      if (consultationType === 'complete' && formData.bodyFatPercentage) {
        consultationData.bodyFatPercentage = parseFloat(formData.bodyFatPercentage);
      }

      console.log('Sending consultation data:', consultationData);
      
      const result = await consultationService.create(consultationData);
      
      if (result.success) {
        const consultationResult = {
          user: user.name,
          weight: formData.weight,
          height: formData.height,
          bodyFatPercentage: consultationData.bodyFatPercentage || null,
          bmi: result.data.bmi,
          bmiCategory: result.data.bmiCategory,
          bodyFatCategory: result.data.bodyFatCategory,
          programCode: result.data.program?.code,
          programName: result.data.program?.name,
          timestamp: new Date().toISOString(),
          consultationId: result.data.id,
          isBMIOnly: !consultationData.bodyFatPercentage
        };
        
        const successMessage = consultationData.bodyFatPercentage ? 
          'Konsultasi lengkap berhasil!' :
          'Konsultasi BMI berhasil!';
        
        toast.success(successMessage);
        
        navigate('/consultation/result', { 
          state: { result: consultationResult } 
        });
        
      } else {
        throw new Error(result.message || 'Konsultasi gagal');
      }
      
    } catch (error) {
      console.error('Consultation error:', error);
      setErrors({ general: error.message || 'Terjadi kesalahan dalam proses konsultasi' });
      toast.error('Konsultasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const bmiValue = calculateBMI();
  const bmiCategory = getBMICategory(parseFloat(bmiValue));

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Konsultasi Program Olahraga
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dapatkan rekomendasi program olahraga yang tepat berdasarkan kondisi tubuh Anda 
            menggunakan sistem forward chaining
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Consultation Type Selector */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Jenis Konsultasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Simple Consultation */}
                  <button
                    type="button"
                    onClick={() => setConsultationType('simple')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      consultationType === 'simple'
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ChartBarIcon className={`h-6 w-6 ${
                        consultationType === 'simple' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="text-left">
                        <div className={`font-medium ${
                          consultationType === 'simple' ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          Konsultasi BMI
                        </div>
                        <div className="text-sm text-gray-600">Cepat & mudah</div>
                      </div>
                    </div>
                  </button>

                  {/* Complete Consultation */}
                  <button
                    type="button"
                    onClick={() => setConsultationType('complete')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      consultationType === 'complete'
                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ScaleIcon className={`h-6 w-6 ${
                        consultationType === 'complete' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div className="text-left">
                        <div className={`font-medium ${
                          consultationType === 'complete' ? 'text-green-900' : 'text-gray-900'
                        }`}>
                          Konsultasi Lengkap
                        </div>
                        <div className="text-sm text-gray-600">Lebih akurat</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">{errors.general}</p>
                  </div>
                )}

                {/* Weight & Height Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Berat Badan (kg) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.weight ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="60.0"
                        disabled={loading}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">kg</span>
                      </div>
                    </div>
                    {errors.weight && (
                      <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                    )}
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tinggi Badan (cm) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.height ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="170.0"
                        disabled={loading}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">cm</span>
                      </div>
                    </div>
                    {errors.height && (
                      <p className="mt-1 text-sm text-red-600">{errors.height}</p>
                    )}
                  </div>
                </div>

                {/* Body Fat (Conditional) */}
                {consultationType === 'complete' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Persentase Lemak Tubuh (%) - Opsional
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        name="bodyFatPercentage"
                        value={formData.bodyFatPercentage}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.bodyFatPercentage ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="15.0"
                        disabled={loading}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                    {errors.bodyFatPercentage && (
                      <p className="mt-1 text-sm text-red-600">{errors.bodyFatPercentage}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Kosongkan jika tidak tahu. Untuk hasil terbaik, gunakan body fat analyzer atau caliper.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-3 ${
                      consultationType === 'complete' 
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentListIcon className="h-5 w-5" />
                        <span>
                          {consultationType === 'complete' 
                            ? 'Mulai Konsultasi Lengkap' 
                            : 'Mulai Konsultasi BMI'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* BMI Preview */}
            {bmiValue && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview BMI</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{bmiValue}</div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
                    bmiCategory === 'Underweight' ? 'bg-yellow-100 text-yellow-800' :
                    bmiCategory === 'Ideal' ? 'bg-green-100 text-green-800' :
                    bmiCategory === 'Overweight' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {bmiCategory}
                  </div>
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Sistem Forward Chaining
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>BMI Only:</strong> 4 program olahraga</p>
                    <p><strong>Lengkap:</strong> 10 kombinasi untuk rekomendasi optimal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-3">
                <CalculatorIcon className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Butuh Kalkulator?
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Belum tahu persentase lemak tubuh Anda?
                  </p>
                  <button
                    onClick={() => navigate('/calculator')}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                    disabled={loading}
                  >
                    Buka Kalkulator →
                  </button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-yellow-900 mb-3">💡 Tips Optimal</h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>• Timbang berat di pagi hari setelah bangun tidur</li>
                <li>• Pastikan data tinggi dan berat akurat</li>
                <li>• Konsultasi lengkap memberikan hasil terbaik</li>
                <li>• Konsultasikan dengan trainer jika perlu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Consultation;