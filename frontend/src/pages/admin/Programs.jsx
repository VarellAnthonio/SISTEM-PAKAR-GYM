import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import ProgramEditModal from '../../components/admin/ProgramEditModal';
import ProgramDetailModal from '../../components/admin/ProgramDetailModal';
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  EyeIcon, 
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { programService } from '../../services/program';
import toast from 'react-hot-toast';

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const result = await programService.getAll();
      
      if (result.success) {
        const sortedPrograms = (result.data || []).sort((a, b) => {
          const numA = parseInt(a.code.replace('P', ''));
          const numB = parseInt(b.code.replace('P', ''));
          return numA - numB;
        });
        setPrograms(sortedPrograms);
      } else {
        toast.error(result.message || 'Failed to load programs');
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(program =>
    program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (program) => {
    setSelectedProgram(program);
    setShowEditModal(true);
  };

  const handleView = (program) => {
    setSelectedProgram(program);
    setShowDetailModal(true);
  };

  const handleSave = async (formData) => {
    try {
      setSaveLoading(true);
      const result = await programService.admin.update(selectedProgram.id, formData);

      if (result.success) {
        toast.success('Program updated successfully');
        await fetchPrograms();
        setShowEditModal(false);
        setSelectedProgram(null);
      } else {
        throw new Error(result.message || 'Failed to update program');
      }
    } catch (error) {
      console.error('Save program error:', error);
      toast.error(error.message || 'Failed to update program');
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedProgram(null);
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
      'L1': 'Low',
      'L2': 'Normal',
      'L3': 'High'
    };
    return mapping[category] || category;
  };

  const getCompletionPercentage = (program) => {
    const requiredFields = ['name', 'description', 'cardioRatio', 'dietRecommendation', 'schedule'];
    const completedFields = requiredFields.filter(field => {
      if (field === 'schedule') {
        return program.schedule && Object.keys(program.schedule).length === 7;
      }
      return program[field] && program[field].trim();
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  if (loading) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminSidebarLayout>
    );
  }

  const activePrograms = programs.filter(p => p.isActive !== false);
  const completedPrograms = programs.filter(p => getCompletionPercentage(p) === 100);

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Program Management</h1>
          <p className="text-gray-600">
            Manage 10 medically validated exercise programs
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                <p className="text-2xl font-bold text-gray-900">{activePrograms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedPrograms.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => {
            const completion = getCompletionPercentage(program);
            
            return (
              <div 
                key={program.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {program.code}
                    </span>
                    {program.isActive !== false && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(program)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(program)}
                      className="text-blue-400 hover:text-blue-600 transition-colors"
                      title="Edit Program"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Program Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {program.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {program.description}
                  </p>
                </div>

                {/* Target Condition */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Target Condition</p>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      {getBMICategoryDisplay(program.bmiCategory)}
                    </span>
                    <span className="text-gray-400">+</span>
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                      {getBodyFatCategoryDisplay(program.bodyFatCategory)}
                    </span>
                  </div>
                </div>

                {/* Completion Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium">{completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        completion === 100 ? 'bg-green-500' : 
                        completion >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(program)}
                    className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md hover:bg-gray-200 transition-colors duration-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(program)}
                    className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No programs available'}
            </p>
          </div>
        )}

        {/* System Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Medical Logic System</h4>
              <p className="text-sm text-blue-700 mt-1">
                All 10 programs are medically validated and cover realistic BMI + Body Fat combinations.
                The forward chaining system is operating at 100% coverage.
              </p>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ProgramDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseModals}
          program={selectedProgram}
        />

        <ProgramEditModal
          isOpen={showEditModal}
          onClose={handleCloseModals}
          program={selectedProgram}
          onSave={handleSave}
          loading={saveLoading}
        />
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminPrograms;