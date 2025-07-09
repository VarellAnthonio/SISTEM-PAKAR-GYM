import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ProgramDetailModal = ({ isOpen, onClose, program }) => {
  if (!isOpen || !program) return null;

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

  const getCompletionStatus = (program) => {
    const requiredFields = ['name', 'description', 'cardioRatio', 'dietRecommendation', 'schedule'];
    const completedFields = requiredFields.filter(field => {
      if (field === 'schedule') {
        return program.schedule && Object.keys(program.schedule).length === 7;
      }
      return program[field] && program[field].trim();
    });
    
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  };

  const completion = getCompletionStatus(program);

  return (
    // RESPONSIVE CONTAINER - BISA SCROLL SELURUH MODAL
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-4 mx-auto">
          
          {/* HEADER - COMPACT */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Program Details - {program.code}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                Complete program information
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            
            {/* Program Overview - RESPONSIVE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                <h3 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">Program Information</h3>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-800">Program Code:</span>
                    <span className="text-xs sm:text-sm font-medium text-blue-900">{program.code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-800">Medical Logic:</span>
                    <span className="text-xs sm:text-sm font-medium text-green-600">✓ Validated</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                <h3 className="text-xs sm:text-sm font-medium text-green-900 mb-2">Target Condition</h3>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-800">BMI Category:</span>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="px-1 sm:px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {program.bmiCategory}
                      </span>
                      <span className="text-xs text-green-900">{getBMICategoryDisplay(program.bmiCategory)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-800">Body Fat:</span>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        {program.bodyFatCategory}
                      </span>
                      <span className="text-xs text-green-900">{getBodyFatCategoryDisplay(program.bodyFatCategory)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Name & Description */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{program.name}</h3>
              {program.description && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Program Description</h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{program.description}</p>
                </div>
              )}
            </div>

            {/* Cardio Ratio & System Info - RESPONSIVE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
                <h4 className="text-xs sm:text-sm font-medium text-orange-900 mb-1">Training Ratio</h4>
                <p className="text-xs sm:text-sm text-orange-800 font-medium">
                  {program.cardioRatio || '50% Kardio - 50% Beban'}
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3">
                <h4 className="text-xs sm:text-sm font-medium text-purple-900 mb-1">System Integration</h4>
                <p className="text-xs sm:text-sm text-purple-800">
                  ✅ Forward Chaining Ready
                </p>
              </div>
            </div>

            {/* Diet Recommendation */}
            {program.dietRecommendation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                <h4 className="text-xs sm:text-sm font-medium text-green-900 mb-1">Diet Recommendation</h4>
                <p className="text-xs sm:text-sm text-green-800 leading-relaxed whitespace-pre-line">
                  {program.dietRecommendation}
                </p>
              </div>
            )}

            {/* Schedule */}
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">7-Day Training Schedule</h4>
              
              {/* Mobile Schedule - ALWAYS CARDS */}
              <div className="space-y-2 sm:space-y-3">
                {Object.entries(program.schedule || {}).map(([day, exercise]) => (
                  <div key={day} className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <h5 className="text-xs sm:text-sm font-medium text-gray-900">{day}</h5>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 whitespace-pre-line">
                      {exercise || <span className="text-gray-400 italic">No schedule set</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className="text-gray-600">Content Completion:</span>
                <span className="font-medium">{completion.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    completion.percentage === 100 ? 'bg-green-500' : 
                    completion.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${completion.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {completion.completed} of {completion.total} required fields completed
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end p-3 sm:p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailModal;