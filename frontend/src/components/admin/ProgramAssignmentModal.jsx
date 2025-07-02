import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProgramAssignmentModal = ({ 
  isOpen, 
  onClose, 
  rule, 
  programs = [],
  onSave, 
  loading = false 
}) => {
  const [selectedProgram, setSelectedProgram] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProgram) {
      toast.error('Pilih program terlebih dahulu');
      return;
    }

    if (selectedProgram === rule?.currentProgram) {
      toast.info('Tidak ada perubahan program');
      onClose();
      return;
    }

    try {
      await onSave(rule, selectedProgram);
    } catch (error) {
      console.error('Save error:', error);
      // Error handling sudah dilakukan di parent component
    }
  };

  const getProgramOptions = () => {
    const availablePrograms = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];
    return availablePrograms.map(code => {
      const program = programs.find(p => p.code === code);
      return {
        code,
        name: program?.name || getProgramDefaultName(code),
        description: program?.description || ''
      };
    });
  };

  const getProgramDefaultName = (code) => {
    const defaultNames = {
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
    return defaultNames[code] || `Program ${code}`;
  };

  const getSelectedProgramInfo = () => {
    if (!selectedProgram) return null;
    const program = programs.find(p => p.code === selectedProgram);
    return program || { 
      code: selectedProgram, 
      name: getProgramDefaultName(selectedProgram) 
    };
  };

  // Reset selected program when modal opens
  useEffect(() => {
    if (isOpen && rule) {
      setSelectedProgram(rule.currentProgram || '');
    }
  }, [isOpen, rule]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedProgram('');
    }
  }, [isOpen]);

  if (!isOpen || !rule) return null;

  const selectedProgramInfo = getSelectedProgramInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Program Assignment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Rule Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Kondisi Target</h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-medium">
                  {rule.bmiCategory}
                </span>
                <span className="text-xs text-gray-500">+</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-medium">
                  {rule.bodyFatCategory}
                </span>
              </div>
              <div className="text-sm text-blue-800">
                {getBMICategoryDisplay(rule.bmiCategory)} + {getBodyFatCategoryDisplay(rule.bodyFatCategory)}
              </div>
            </div>

            {/* Current Assignment */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Assignment Saat Ini</h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded">
                    {rule.currentProgram}
                  </span>
                  <div className="text-sm text-gray-600 mt-1">{rule.name}</div>
                </div>
                {rule.currentProgram !== rule.defaultProgram && (
                  <div className="text-xs text-orange-600">
                    ⚠️ Modified dari default {rule.defaultProgram}
                  </div>
                )}
              </div>
            </div>

            {/* Program Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Program Baru *
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">-- Pilih Program --</option>
                {getProgramOptions().map(option => (
                  <option key={option.code} value={option.code}>
                    {option.code} - {option.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Program akan digunakan untuk semua user dengan kondisi ini
              </p>
            </div>

            {/* Selected Program Info */}
            {selectedProgramInfo && selectedProgram !== rule.currentProgram && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-900 mb-2">Preview Perubahan</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <div>
                    <strong>Forward Chaining Result:</strong>
                  </div>
                  <div className="bg-green-100 rounded p-2 font-mono text-xs">
                    <div>IF BMI = {getBMICategoryDisplay(rule.bmiCategory)}</div>
                    <div>AND Body Fat = {getBodyFatCategoryDisplay(rule.bodyFatCategory)}</div>
                    <div className="font-bold text-green-900">
                      THEN Program = <span className="px-1 bg-green-200 rounded">{selectedProgram}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <strong>Program:</strong> {selectedProgramInfo.name}
                  </div>
                </div>
              </div>
            )}

            {/* Warning if reverting to default */}
            {selectedProgram === rule.defaultProgram && rule.currentProgram !== rule.defaultProgram && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-1">ℹ️ Kembali ke Default</h3>
                <p className="text-sm text-blue-800">
                  Anda akan mengembalikan assignment ke program default <strong>{rule.defaultProgram}</strong>
                </p>
              </div>
            )}

            {/* Advanced Warning if changing critical programs */}
            {selectedProgram && ['P4'].includes(selectedProgram) && selectedProgram !== rule.currentProgram && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-900 mb-1">⚠️ Program Khusus</h3>
                <p className="text-sm text-yellow-800">
                  {selectedProgram === 'P4' && 'P4 adalah program extreme weight loss untuk kondisi obese. Pastikan assignment ini sesuai dengan medical guidance.'}
                </p>
              </div>
            )}

            {/* No Change Warning */}
            {selectedProgram && selectedProgram === rule.currentProgram && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-1">ℹ️ Tidak Ada Perubahan</h3>
                <p className="text-sm text-gray-600">
                  Program yang dipilih sama dengan assignment saat ini
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !selectedProgram || selectedProgram === rule.currentProgram}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                'Simpan Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramAssignmentModal;