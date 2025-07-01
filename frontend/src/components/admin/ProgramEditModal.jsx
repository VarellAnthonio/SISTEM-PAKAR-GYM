import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProgramEditModal = ({ 
  isOpen, 
  onClose, 
  program, 
  onSave, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    bmiCategory: '',
    bodyFatCategory: '',
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

  // Initialize form data when program changes
  useEffect(() => {
    if (program) {
      setFormData({
        code: program.code || '',
        name: program.name || '',
        description: program.description || '',
        bmiCategory: program.bmiCategory || '',
        bodyFatCategory: program.bodyFatCategory || '',
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
      });
      setErrors({});
    }
  }, [program]);

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

    if (!formData.code) {
      newErrors.code = 'Kode program harus diisi';
    } else if (!/^P\d+$/.test(formData.code)) {
      newErrors.code = 'Kode program harus format P1, P2, P3, dst.';
    }

    if (!formData.name) {
      newErrors.name = 'Nama program harus diisi';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nama program minimal 3 karakter';
    }

    if (!formData.bmiCategory) {
      newErrors.bmiCategory = 'Kategori BMI harus dipilih';
    }

    if (!formData.bodyFatCategory) {
      newErrors.bodyFatCategory = 'Kategori Body Fat harus dipilih';
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

    try {
      await onSave(formData);
      onClose();
      toast.success('Program berhasil disimpan');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Gagal menyimpan program');
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      bmiCategory: '',
      bodyFatCategory: '',
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {program?.id ? 'Edit Program' : 'Tambah Program'} - {formData.code}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
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
                      Kode Program *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.code ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="P1, P2, P3..."
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
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
                  </div>
                </div>

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
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deskripsi program olahraga..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori BMI *
                    </label>
                    <select
                      name="bmiCategory"
                      value={formData.bmiCategory}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.bmiCategory ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Pilih Kategori BMI</option>
                      <option value="B1">B1 - Underweight (&lt;18.5)</option>
                      <option value="B2">B2 - Ideal (18.5-24.9)</option>
                      <option value="B3">B3 - Overweight (25-29.9)</option>
                      <option value="B4">B4 - Obese (≥30)</option>
                    </select>
                    {errors.bmiCategory && (
                      <p className="mt-1 text-sm text-red-600">{errors.bmiCategory}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Body Fat *
                    </label>
                    <select
                      name="bodyFatCategory"
                      value={formData.bodyFatCategory}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.bodyFatCategory ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Pilih Kategori Body Fat</option>
                      <option value="L1">L1 - Rendah</option>
                      <option value="L2">L2 - Normal</option>
                      <option value="L3">L3 - Tinggi</option>
                    </select>
                    {errors.bodyFatCategory && (
                      <p className="mt-1 text-sm text-red-600">{errors.bodyFatCategory}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Jadwal Latihan 7 Hari</h3>
                  <p className="text-sm text-blue-800">
                    Isi jadwal latihan untuk setiap hari. Format: "1. Exercise: sets×reps"
                  </p>
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
                    rows={6}
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
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Menyimpan...' : 'Simpan Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramEditModal;