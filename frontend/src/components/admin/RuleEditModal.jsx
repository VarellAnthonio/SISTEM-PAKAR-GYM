import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RuleEditModal = ({ 
  isOpen, 
  onClose, 
  rule, 
  onSave, 
  loading = false,
  programs = [] 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bmiCategory: '',
    bodyFatCategory: '',
    programId: '',
    priority: 1,
    isActive: true
  });
  
  const [errors, setErrors] = useState({});

  // Initialize form data when rule changes
  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        bmiCategory: rule.bmiCategory || '',
        bodyFatCategory: rule.bodyFatCategory || '',
        programId: rule.programId || '',
        priority: rule.priority || 1,
        isActive: rule.isActive !== undefined ? rule.isActive : true
      });
      setErrors({});
    }
  }, [rule]);

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

    // Auto-generate name and description when categories change
    if (name === 'bmiCategory' || name === 'bodyFatCategory') {
      const updatedData = { ...formData, [name]: value };
      if (updatedData.bmiCategory && updatedData.bodyFatCategory) {
        const bmiDisplay = getBMICategoryDisplay(updatedData.bmiCategory);
        const bodyFatDisplay = getBodyFatCategoryDisplay(updatedData.bodyFatCategory);
        const selectedProgram = programs.find(p => p.id === parseInt(updatedData.programId));
        
        setFormData(prev => ({
          ...prev,
          [name]: value,
          name: `Rule for ${bmiDisplay} + ${bodyFatDisplay}`,
          description: `IF BMI = ${bmiDisplay} AND Body Fat = ${bodyFatDisplay} THEN Program = ${selectedProgram?.code || 'TBD'}`
        }));
      }
    }

    // Update description when program changes
    if (name === 'programId') {
      const selectedProgram = programs.find(p => p.id === parseInt(value));
      if (selectedProgram && formData.bmiCategory && formData.bodyFatCategory) {
        const bmiDisplay = getBMICategoryDisplay(formData.bmiCategory);
        const bodyFatDisplay = getBodyFatCategoryDisplay(formData.bodyFatCategory);
        
        setFormData(prev => ({
          ...prev,
          [name]: value,
          description: `IF BMI = ${bmiDisplay} AND Body Fat = ${bodyFatDisplay} THEN Program = ${selectedProgram.code}`
        }));
      }
    }
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Nama rule harus diisi';
    }

    if (!formData.bmiCategory) {
      newErrors.bmiCategory = 'Kategori BMI harus dipilih';
    }

    if (!formData.bodyFatCategory) {
      newErrors.bodyFatCategory = 'Kategori Body Fat harus dipilih';
    }

    if (!formData.programId) {
      newErrors.programId = 'Program harus dipilih';
    }

    if (!formData.priority || formData.priority < 1) {
      newErrors.priority = 'Priority harus diisi dan minimal 1';
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
      toast.success('Rule berhasil disimpan');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Gagal menyimpan rule');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      bmiCategory: '',
      bodyFatCategory: '',
      programId: '',
      priority: 1,
      isActive: true
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const selectedProgram = programs.find(p => p.id === parseInt(formData.programId));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {rule?.id ? 'Edit Rule' : 'Tambah Rule'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
            {/* Rule Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <input
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.priority ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="1"
                />
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Urutan prioritas evaluasi rule</p>
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
                    Rule Aktif
                  </label>
                </div>
              </div>
            </div>

            {/* Conditions */}
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

            {/* Program Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Target *
              </label>
              <select
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.programId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Pilih Program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.code} - {program.name}
                  </option>
                ))}
              </select>
              {errors.programId && (
                <p className="mt-1 text-sm text-red-600">{errors.programId}</p>
              )}
            </div>

            {/* Rule Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Rule *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Rule for BMI + Body Fat combination"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Rule Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Rule
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="IF condition THEN action"
              />
              <p className="mt-1 text-sm text-gray-500">
                Format: IF BMI = [kategori] AND Body Fat = [kategori] THEN Program = [kode]
              </p>
            </div>

            {/* Preview */}
            {formData.bmiCategory && formData.bodyFatCategory && selectedProgram && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Preview Rule</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <strong>Kondisi:</strong> {getBMICategoryDisplay(formData.bmiCategory)} + {getBodyFatCategoryDisplay(formData.bodyFatCategory)}
                  </div>
                  <div>
                    <strong>Program:</strong> {selectedProgram.code} - {selectedProgram.name}
                  </div>
                  <div>
                    <strong>Forward Chaining:</strong><br />
                    IF BMI = {getBMICategoryDisplay(formData.bmiCategory)} AND Body Fat = {getBodyFatCategoryDisplay(formData.bodyFatCategory)}<br />
                    THEN Program = {selectedProgram.code}
                  </div>
                </div>
              </div>
            )}

            {/* Body Fat Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-green-900 mb-2">Body Fat - Pria</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <div>L1: &lt;10% (Rendah)</div>
                  <div>L2: 10-20% (Normal)</div>
                  <div>L3: &gt;20% (Tinggi)</div>
                </div>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-pink-900 mb-2">Body Fat - Wanita</h4>
                <div className="text-sm text-pink-800 space-y-1">
                  <div>L1: &lt;20% (Rendah)</div>
                  <div>L2: 20-30% (Normal)</div>
                  <div>L3: &gt;30% (Tinggi)</div>
                </div>
              </div>
            </div>
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
              {loading ? 'Menyimpan...' : 'Simpan Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RuleEditModal;