import { useState, useEffect } from 'react';
import { XMarkIcon, LockClosedIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProgramEditModal = ({ 
  isOpen, 
  onClose, 
  program, 
  onSave, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cardioRatio: '',
    dietRecommendation: '',
    schedule: {
      'Senin': '',
      'Selasa': '',
      'Rabu': '',
      'Kamis': '',
      'Jumat': '',
      'Sabtu': '',
      'Minggu': ''
    },
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when program changes
  useEffect(() => {
    if (program) {
      const newFormData = {
        name: program.name || '',
        description: program.description || '',
        cardioRatio: program.cardioRatio || '50% Kardio - 50% Beban',
        dietRecommendation: program.dietRecommendation || '',
        schedule: program.schedule || {
          'Senin': '',
          'Selasa': '',
          'Rabu': '',
          'Kamis': '',
          'Jumat': '',
          'Sabtu': '',
          'Minggu': ''
        },
        isActive: program.isActive !== undefined ? program.isActive : true
      };
      setFormData(newFormData);
      setErrors({});
      setHasChanges(false);
    }
  }, [program]);

  // Track changes
  useEffect(() => {
    if (program) {
      const hasChanged = 
        formData.name !== (program.name || '') ||
        formData.description !== (program.description || '') ||
        formData.cardioRatio !== (program.cardioRatio || '50% Kardio - 50% Beban') ||
        formData.dietRecommendation !== (program.dietRecommendation || '') ||
        formData.isActive !== (program.isActive !== undefined ? program.isActive : true) ||
        JSON.stringify(formData.schedule) !== JSON.stringify(program.schedule || {});
      
      setHasChanges(hasChanged);
    }
  }, [formData, program]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleScheduleChange = (day, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Nama program harus diisi';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nama program minimal 3 karakter';
    }

    // Validate schedule - at least one day should have content
    const hasSchedule = Object.values(formData.schedule).some(day => day.trim());
    if (!hasSchedule) {
      newErrors.schedule = 'Minimal satu hari harus memiliki jadwal latihan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon perbaiki error pada form');
      return;
    }

    if (!hasChanges) {
      toast.info('Tidak ada perubahan untuk disimpan');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('Ada perubahan yang belum disimpan. Yakin ingin menutup?')) {
        resetForm();
        onClose();
      }
    } else {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cardioRatio: '',
      dietRecommendation: '',
      schedule: {
        'Senin': '',
        'Selasa': '',
        'Rabu': '',
        'Kamis': '',
        'Jumat': '',
        'Sabtu': '',
        'Minggu': ''
      },
      isActive: true
    });
    setErrors({});
    setActiveTab('basic');
    setHasChanges(false);
  };

  const getBMICategoryDisplay = (category) => {
    const mapping = {
      'B1': 'Underweight',
      'B2': 'Ideal',
      'B3': 'Overweight',
      'B4': 'Obese'
    };
    return mapping[category] || category;
  };

  const getBodyFatCategoryDisplay = (category) => {
    const mapping = {
      'L1': 'Rendah',
      'L2': 'Normal',
      'L3': 'Tinggi'
    };
    return mapping[category] || category;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Program {program?.code}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Edit konten program - struktur tidak dapat diubah
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Protected Fields Info */}
        <div className="mx-6 mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <LockClosedIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Protected Fields (Read-Only)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Code:</span>
                  <span className="ml-2 font-medium">{program?.code}</span>
                </div>
                <div>
                  <span className="text-gray-600">BMI Target:</span>
                  <span className="ml-2 font-medium">{getBMICategoryDisplay(program?.bmiCategory)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Body Fat Target:</span>
                  <span className="ml-2 font-medium">{getBodyFatCategoryDisplay(program?.bodyFatCategory)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Fields ini tidak dapat diubah untuk menjaga integritas medical logic
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mt-4">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Info Dasar
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Jadwal Latihan
            </button>
            <button
              onClick={() => setActiveTab('diet')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'diet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Diet & Rasio
            </button>
          </nav>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Program *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Fat Loss Program"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Program
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Program Aktif
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Nonaktif = tidak akan muncul dalam forward chaining
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Program
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deskripsi lengkap program olahraga..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jelaskan tujuan dan karakteristik program ini
                  </p>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 mb-2">Jadwal Latihan 7 Hari</h3>
                      <p className="text-sm text-blue-800">
                        Isi jadwal latihan untuk setiap hari. Format: "1. Exercise: sets×reps". 
                        Gunakan "Rest" atau "Cardio" untuk hari istirahat/kardio.
                      </p>
                    </div>
                  </div>
                </div>

                {Object.keys(formData.schedule).map((day) => (
                  <div key={day}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {day}
                    </label>
                    <textarea
                      value={formData.schedule[day]}
                      onChange={(e) => handleScheduleChange(day, e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Jadwal latihan untuk hari ${day}...
Contoh:
1. Bench Press: 3×6-8
2. Shoulder Press: 3×8-10
atau "Rest/Cardio" untuk hari istirahat`}
                    />
                  </div>
                ))}

                {errors.schedule && (
                  <p className="text-sm text-red-600">{errors.schedule}</p>
                )}
              </div>
            )}

            {/* Diet & Ratio Tab */}
            {activeTab === 'diet' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rasio Kardio - Beban
                  </label>
                  <input
                    type="text"
                    name="cardioRatio"
                    value={formData.cardioRatio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50% Kardio - 50% Beban"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Contoh: "70% Kardio - 30% Beban" atau "10% Kardio - 90% Beban"
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rekomendasi Diet
                  </label>
                  <textarea
                    name="dietRecommendation"
                    value={formData.dietRecommendation}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rekomendasi diet dan nutrisi untuk program ini...

Contoh:
- Fokus pada surplus kalori 300-500 kalori dengan makanan kaya protein
- Konsumsi protein 1.5-2g per kg berat badan
- Karbohidrat kompleks untuk energi latihan
- Lemak sehat 20-30% dari total kalori"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-900 mb-2">Tips Rekomendasi Diet</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Sesuaikan dengan tujuan program (fat loss, muscle gain, maintenance)</li>
                    <li>• Berikan panduan kalori yang spesifik (surplus/defisit)</li>
                    <li>• Sertakan ratio makronutrien (protein/karbo/lemak)</li>
                    <li>• Tambahkan contoh makanan yang direkomendasikan</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {hasChanges ? (
                <span className="text-orange-600 font-medium">● Ada perubahan yang belum disimpan</span>
              ) : (
                <span>Tidak ada perubahan</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !hasChanges}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Menyimpan...</span>
                  </div>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramEditModal;