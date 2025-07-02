import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RuleEditModal = ({ 
  isOpen, 
  onClose, 
  rule, 
  onSave, 
  loading = false,
  programs = [],
  mode = "assignment-only"
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState('');

  // Initialize with current program assignment
  useEffect(() => {
    if (rule) {
      setSelectedProgramId(rule.programId?.toString() || '');
    }
  }, [rule]);

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
    
    if (!selectedProgramId) {
      toast.error('Pilih program assignment');
      return;
    }

    try {
      await onSave({ 
        programId: parseInt(selectedProgramId)
      });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleClose = () => {
    setSelectedProgramId('');
    onClose();
  };

  if (!isOpen || !rule) return null;

  const currentProgram = programs.find(p => p.id === parseInt(selectedProgramId));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Program Assignment
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
          <div className="p-6 space-y-6">
            
            {/* Condition Display (Read-only) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Condition</h3>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                    {rule.bmiCategory}
                  </span>
                  <span className="text-gray-500">+</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-medium">
                    {rule.bodyFatCategory}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  {getBMICategoryDisplay(rule.bmiCategory)} + {getBodyFatCategoryDisplay(rule.bodyFatCategory)}
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                Forward chaining: IF BMI = {rule.bmiCategory} AND Body Fat = {rule.bodyFatCategory} THEN Program = ?
              </div>
            </div>

            {/* Program Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Program *
              </label>
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.code} - {program.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Assignment Preview */}
            {currentProgram && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Selected Program</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div><strong>Code:</strong> {currentProgram.code}</div>
                  <div><strong>Name:</strong> {currentProgram.name}</div>
                  <div><strong>Target:</strong> {currentProgram.bmiCategory}+{currentProgram.bodyFatCategory}</div>
                  <div><strong>Ratio:</strong> {currentProgram.cardioRatio}</div>
                </div>
              </div>
            )}

            {/* Program Options Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Available Programs</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {programs.slice(0, 10).map(program => (
                  <div key={program.id} className="flex justify-between">
                    <span className="font-medium">{program.code}:</span>
                    <span className="text-gray-600 truncate ml-2">{program.name}</span>
                  </div>
                ))}
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedProgramId}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Update Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RuleEditModal;