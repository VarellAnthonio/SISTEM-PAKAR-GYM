import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import ExerciseModal from '../../components/exercise/ExerciseModal';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { exerciseService } from '../../services/exercise';
import toast from 'react-hot-toast';

const AdminExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const [stats, setStats] = useState({
    total: 0,
    withVideo: 0,
    withoutVideo: 0,
    byCategory: {},
    byDifficulty: {}
  });

  const categories = ['All', 'Push', 'Pull', 'Leg', 'Full Body', 'Cardio'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchExercises();
  }, [pagination.page, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page === 1) {
        fetchExercises();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(selectedDifficulty !== 'All' && { difficulty: selectedDifficulty })
      };

      const result = await exerciseService.getAll(params);
      
      if (result.success) {
        setExercises(result.data.exercises || []);
        
        if (result.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: result.data.pagination.total || 0,
            totalPages: result.data.pagination.totalPages || 0
          }));
        }

        // Calculate stats
        const allExercises = result.data.exercises || [];
        calculateStats(allExercises);
      } else {
        toast.error(result.message || 'Failed to load exercises');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (exercisesData) => {
    const withVideo = exercisesData.filter(ex => ex.youtubeUrl).length;
    const byCategory = {};
    const byDifficulty = {};

    exercisesData.forEach(exercise => {
      byCategory[exercise.category] = (byCategory[exercise.category] || 0) + 1;
      byDifficulty[exercise.difficulty] = (byDifficulty[exercise.difficulty] || 0) + 1;
    });

    setStats({
      total: exercisesData.length,
      withVideo,
      withoutVideo: exercisesData.length - withVideo,
      byCategory,
      byDifficulty
    });
  };

  const handleCreate = () => {
    setSelectedExercise(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleView = (exercise) => {
    setSelectedExercise(exercise);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (exercise) => {
    setSelectedExercise(exercise);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      setSaveLoading(true);
      let result;

      if (modalMode === 'create') {
        result = await exerciseService.create(formData);
      } else {
        result = await exerciseService.update(selectedExercise.id, formData);
      }

      if (result.success) {
        toast.success(modalMode === 'create' ? 'Exercise created successfully' : 'Exercise updated successfully');
        await fetchExercises();
        setShowModal(false);
        setSelectedExercise(null);
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save exercise');
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (exerciseId) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    try {
      const result = await exerciseService.delete(exerciseId);
      
      if (result.success) {
        toast.success('Exercise deleted successfully');
        await fetchExercises();
        setShowModal(false);
        setSelectedExercise(null);
      } else {
        toast.error(result.message || 'Failed to delete exercise');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete exercise');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Push': 'bg-red-100 text-red-800',
      'Pull': 'bg-blue-100 text-blue-800',
      'Leg': 'bg-green-100 text-green-800',
      'Full Body': 'bg-purple-100 text-purple-800',
      'Cardio': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (loading && exercises.length === 0) {
    return (
      <AdminSidebarLayout>
        <div className="max-w-7xl">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading exercises...</p>
            </div>
          </div>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Exercise Management</h1>
            <p className="text-gray-600 mt-1">Manage exercise database with YouTube video integration</p>
            
            {/* Data Source Indicator */}
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-sm text-green-800">
                ✅ <strong>Real-time Data:</strong> Connected to exercise API with YouTube integration
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Exercise
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Total Exercises</h3>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
            <p className="text-xs text-blue-600">in database</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">With Video</h3>
            <p className="text-2xl font-bold text-green-800">{stats.withVideo}</p>
            <p className="text-xs text-green-600">YouTube tutorials</p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-900">Without Video</h3>
            <p className="text-2xl font-bold text-orange-800">{stats.withoutVideo}</p>
            <p className="text-xs text-orange-600">need videos</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900">Coverage</h3>
            <p className="text-2xl font-bold text-purple-800">
              {stats.total > 0 ? Math.round((stats.withVideo / stats.total) * 100) : 0}%
            </p>
            <p className="text-xs text-purple-600">video coverage</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              {/* Video Thumbnail */}
              <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                {exercise.youtubeUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={`https://img.youtube.com/vi/${exerciseService.utils.extractVideoId(exercise.youtubeUrl)}/maxresdefault.jpg`}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${exerciseService.utils.extractVideoId(exercise.youtubeUrl)}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <PlayIcon className="h-12 w-12 text-white opacity-80" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No video</p>
                  </div>
                )}
              </div>

              {/* Exercise Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                    {exercise.name}
                  </h3>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleView(exercise)}
                      className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(exercise)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Exercise"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Delete Exercise"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(exercise.category)}`}>
                    {exercise.category}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                  {exercise.description || 'No description available'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {exercise.sets ? `Sets: ${exercise.sets}` : 'No sets specified'}
                  </span>
                  <span className={`inline-flex items-center ${exercise.youtubeUrl ? 'text-green-600' : 'text-orange-600'}`}>
                    {exercise.youtubeUrl ? '✓ Video' : '○ No video'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {exercises.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mb-4">
              <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No exercises found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first exercise'}
            </p>
            {(!searchTerm && selectedCategory === 'All' && selectedDifficulty === 'All') && (
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Add First Exercise
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} exercises
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Category Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.slice(1).map(category => {
            const count = stats.byCategory[category] || 0;
            return (
              <div key={category} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className={`inline-block px-2 py-1 text-xs font-medium rounded mb-2 ${getCategoryColor(category)}`}>
                  {category}
                </div>
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500">exercises</div>
              </div>
            );
          })}
        </div>

        {/* System Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Exercise System Features</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>YouTube Integration:</strong> Direct video embedding with automatic thumbnail generation</p>
                <p>• <strong>Category System:</strong> Push, Pull, Leg, Full Body, and Cardio exercises</p>
                <p>• <strong>Difficulty Levels:</strong> Beginner, Intermediate, and Advanced classifications</p>
                <p>• <strong>Equipment Tracking:</strong> Required equipment for each exercise</p>
                <p>• <strong>Muscle Groups:</strong> Detailed muscle group targeting for program integration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Modal */}
        <ExerciseModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedExercise(null);
          }}
          exercise={selectedExercise}
          onSave={handleSave}
          onDelete={handleDelete}
          loading={saveLoading}
          mode={modalMode}
        />
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminExercises;