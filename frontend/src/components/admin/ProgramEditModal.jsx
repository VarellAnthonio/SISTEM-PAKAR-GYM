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
    }
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
        }
      };
      setFormData(newFormData);
      setErrors({});
      setHasChanges(false);
    }
  }, [program]);

  // Track changes - REMOVED isActive from comparison
  useEffect(() => {
    if (program) {
      const hasChanged = 
        formData.name !== (program.name || '') ||
        formData.description !== (program.description || '') ||
        formData.cardioRatio !== (program.cardioRatio || '50% Kardio - 50% Beban') ||
        formData.dietRecommendation !== (program.dietRecommendation || '') ||
        JSON.stringify(formData.schedule) !== JSON.stringify(program.schedule || {});
      
      setHasChanges(hasChanged);
    }
  }, [formData, program]);

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
      }
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
    // RESPONSIVE CONTAINER - BISA SCROLL SELURUH MODAL
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-4 mx-auto">
        
          {/* HEADER - COMPACT */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white rounded-t-lg">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Edit Program Content - {program?.code}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                Edit program content only - system structure is protected
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* TABS - MOBILE FRIENDLY */}
          <div className="border-b border-gray-200 mt-2 sm:mt-3">
            <nav className="flex space-x-4 sm:space-x-8 px-3 sm:px-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('basic')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'basic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Program Info
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'schedule'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Training Schedule
              </button>
              <button
                onClick={() => setActiveTab('diet')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'diet'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Diet & Cardio
              </button>
            </nav>
          </div>

          {/* FORM CONTENT */}
          <form onSubmit={handleSubmit}>
            <div className="p-3 sm:p-4">
              
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-3 sm:space-y-4">
                  
                  {/* Program Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Program Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-2 sm:px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Fat Loss Program"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Program Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                      placeholder="Comprehensive description of the exercise program..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Explain the program's purpose, target audience, and expected outcomes
                    </p>
                  </div>

                  {/* Program Info Display */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Program Information</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Target:</span>
                        <div className="text-blue-800">
                          {getBMICategoryDisplay(program?.bmiCategory)} + {getBodyFatCategoryDisplay(program?.bodyFatCategory)}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">System Code:</span>
                        <div className="text-blue-800 font-mono">{program?.code}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                    <div className="flex items-start">
                      <InformationCircleIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">7-Day Training Schedule</h3>
                        <p className="text-xs text-blue-800">
                          Format: "1. Exercise: sets×reps" or "Cardio: 30 minutes" or "Rest"
                        </p>
                      </div>
                    </div>
                  </div>

                  {Object.keys(formData.schedule).map((day) => (
                    <div key={day}>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        {day}
                      </label>
                      <textarea
                        value={formData.schedule[day]}
                        onChange={(e) => handleScheduleChange(day, e.target.value)}
                        rows={3}
                        className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        placeholder={`Training plan for ${day}...`}
                      />
                    </div>
                  ))}

                  {errors.schedule && (
                    <p className="text-xs text-red-600">{errors.schedule}</p>
                  )}
                </div>
              )}

              {/* Diet & Cardio Tab */}
              {activeTab === 'diet' && (
                <div className="space-y-3 sm:space-y-4">
                  
                  {/* Cardio Ratio */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Cardio - Weight Training Ratio
                    </label>
                    <input
                      type="text"
                      name="cardioRatio"
                      value={formData.cardioRatio}
                      onChange={handleChange}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="50% Kardio - 50% Beban"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Example: "70% Kardio - 30% Beban" or "30% Cardio - 70% Weight Training"
                    </p>
                  </div>

                  {/* Diet Recommendation */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Diet Recommendation
                    </label>
                    <textarea
                      name="dietRecommendation"
                      value={formData.dietRecommendation}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                      placeholder="Comprehensive diet and nutrition guidelines for this program..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Include calorie guidance, macronutrient ratios, meal timing, and specific food recommendations
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 border-t border-gray-200 bg-gray-50 space-y-2 sm:space-y-0 rounded-b-lg">
              <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                {hasChanges ? (
                  <span className="text-orange-600 font-medium">● Unsaved changes</span>
                ) : (
                  <span>No changes</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !hasChanges}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgramEditModal;