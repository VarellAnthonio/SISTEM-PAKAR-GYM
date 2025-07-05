// frontend/src/pages/admin/Exercises.jsx - FIXED VERSION (Load All Exercises)
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
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // Active, Inactive, All
  const [videoFilter, setVideoFilter] = useState('All'); // With Video, Without Video, All
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Pagination for display (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(9); // Show more per page for admin
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withVideo: 0,
    withoutVideo: 0,
    videoPercentage: 0,
    byCategory: {},
    byDifficulty: {}
  });

  const categories = ['All', 'Push', 'Pull', 'Leg', 'Full Body', 'Cardio'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const statusOptions = ['All', 'Active', 'Inactive'];
  const videoOptions = ['All', 'With Video', 'Without Video'];

  useEffect(() => {
    console.log('🔄 Admin Exercise page mounted, fetching ALL exercises...');
    fetchAllExercises();
  }, []);

  // Filter exercises when search/filters change
  useEffect(() => {
    filterExercises();
    setCurrentPage(1); // Reset to first page when filters change
  }, [exercises, searchTerm, selectedCategory, selectedDifficulty, statusFilter, videoFilter]);

  const fetchAllExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching ALL exercises for admin (no pagination limit)...');

      // Fetch ALL exercises by setting a high limit
      const params = {
        limit: 1000, // High limit to get all exercises
        page: 1,
        active: undefined // Get both active and inactive
      };

      const result = await exerciseService.getAll(params);
      
      console.log('📥 Admin Exercise API result:', result);
      
      if (result.success) {
        const exercisesData = result.data?.exercises || result.data || [];
        console.log('✅ Total exercises loaded for admin:', exercisesData.length);
        
        setExercises(exercisesData);
        calculateStats(exercisesData);
      } else {
        console.error('❌ Admin Exercise API failed:', result.message);
        setError(result.message || 'Failed to load exercises');
        toast.error(result.message || 'Failed to load exercises');
      }
    } catch (error) {
      console.error('💥 Admin Exercise fetch error:', error);
      setError(error.message || 'Failed to load exercises');
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = [...exercises];

    // Apply filters
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(exercise => 
        exercise.name?.toLowerCase().includes(searchLower) ||
        exercise.description?.toLowerCase().includes(searchLower) ||
        exercise.muscleGroups?.some(muscle => muscle.toLowerCase().includes(searchLower)) ||
        exercise.equipment?.some(equip => equip.toLowerCase().includes(searchLower))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'Active') {
        filtered = filtered.filter(exercise => exercise.isActive !== false);
      } else if (statusFilter === 'Inactive') {
        filtered = filtered.filter(exercise => exercise.isActive === false);
      }
    }

    if (videoFilter !== 'All') {
      if (videoFilter === 'With Video') {
        filtered = filtered.filter(exercise => exercise.youtubeUrl || exercise.videoUrl);
      } else if (videoFilter === 'Without Video') {
        filtered = filtered.filter(exercise => !exercise.youtubeUrl && !exercise.videoUrl);
      }
    }

    console.log('🔍 Admin filtered exercises:', filtered.length, 'from total:', exercises.length);
    setFilteredExercises(filtered);
  };

  const calculateStats = (exercisesData) => {
    console.log('📊 Calculating admin stats for exercises:', exercisesData.length);
    
    const active = exercisesData.filter(ex => ex.isActive !== false).length;
    const inactive = exercisesData.filter(ex => ex.isActive === false).length;
    const withVideo = exercisesData.filter(ex => ex.youtubeUrl || ex.videoUrl).length;
    const withoutVideo = exercisesData.length - withVideo;
    const videoPercentage = exercisesData.length > 0 ? Math.round((withVideo / exercisesData.length) * 100) : 0;
    
    const byCategory = {};
    const byDifficulty = {};

    exercisesData.forEach(exercise => {
      byCategory[exercise.category] = (byCategory[exercise.category] || 0) + 1;
      byDifficulty[exercise.difficulty] = (byDifficulty[exercise.difficulty] || 0) + 1;
    });

    const newStats = {
      total: exercisesData.length,
      active,
      inactive,
      withVideo,
      withoutVideo,
      videoPercentage,
      byCategory,
      byDifficulty
    };

    console.log('📈 Admin stats calculated:', newStats);
    setStats(newStats);
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
        await fetchAllExercises(); // Reload all exercises
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
        await fetchAllExercises(); // Reload all exercises
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

  const handleToggleStatus = async (exercise) => {
    try {
      const result = await exerciseService.toggleStatus(exercise.id);
      
      if (result.success) {
        toast.success(`Exercise ${exercise.isActive ? 'deactivated' : 'activated'} successfully`);
        await fetchAllExercises(); // Reload all exercises
      } else {
        toast.error(result.message || 'Failed to toggle exercise status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to toggle exercise status');
    }
  };

  // Client-side pagination
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setStatusFilter('All');
    setVideoFilter('All');
  };

  // Error state
  if (error && !loading && exercises.length === 0) {
    return (
      <AdminSidebarLayout>
        <div className="max-w-7xl">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Exercises</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchAllExercises();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminSidebarLayout>
    );
  }

  // Loading state
  if (loading && exercises.length === 0) {
    return (
      <AdminSidebarLayout>
        <div className="max-w-7xl">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading all exercises for management...</p>
            </div>
          </div>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl">
        {/* Debug Info for Admin */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900">🔧 Admin Exercise Management</h4>
            <div className="mt-1 text-xs text-blue-800 space-y-1">
              <p>• <strong>Total exercises in database:</strong> {exercises.length}</p>
              <p>• <strong>After admin filters:</strong> {filteredExercises.length}</p>
              <p>• <strong>Showing on page:</strong> {currentExercises.length} (Page {currentPage} of {totalPages})</p>
              <p>• <strong>Active:</strong> {stats.active} | <strong>Inactive:</strong> {stats.inactive}</p>
              <p>• <strong>With video:</strong> {stats.withVideo} | <strong>Without video:</strong> {stats.withoutVideo}</p>
              <p>• <strong>Video coverage:</strong> {stats.videoPercentage}%</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Exercise Management</h1>
            <p className="text-gray-600 mt-1">Manage complete exercise database with YouTube integration</p>
            
            {/* Data Source Indicator */}
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-sm text-green-800">
                ✅ <strong>Complete Database:</strong> {exercises.length} exercises loaded from API
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

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Total Exercises</h3>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
            <p className="text-xs text-blue-600">in database</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">Active</h3>
            <p className="text-2xl font-bold text-green-800">{stats.active}</p>
            <p className="text-xs text-green-600">available to users</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-900">Inactive</h3>
            <p className="text-2xl font-bold text-red-800">{stats.inactive}</p>
            <p className="text-xs text-red-600">hidden from users</p>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-emerald-900">With Video</h3>
            <p className="text-2xl font-bold text-emerald-800">{stats.withVideo}</p>
            <p className="text-xs text-emerald-600">YouTube tutorials</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900">Coverage</h3>
            <p className="text-2xl font-bold text-purple-800">{stats.videoPercentage}%</p>
            <p className="text-xs text-purple-600">video coverage</p>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
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
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Video Filter */}
            <div>
              <select
                value={videoFilter}
                onChange={(e) => setVideoFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {videoOptions.map(video => (
                  <option key={video} value={video}>{video}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All' || statusFilter !== 'All' || videoFilter !== 'All') && (
            <div className="mt-4">
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstExercise + 1}-{Math.min(indexOfLastExercise, filteredExercises.length)} of {filteredExercises.length} exercises
          </p>
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {currentExercises.map((exercise) => (
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
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Video
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No video</p>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    exercise.isActive !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {exercise.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
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

                {/* Admin Actions */}
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(exercise)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                      exercise.isActive !== false
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {exercise.isActive !== false ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredExercises.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="mb-4">
              <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No exercises found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All' || statusFilter !== 'All' || videoFilter !== 'All'
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first exercise'}
            </p>
            {(!searchTerm && selectedCategory === 'All' && selectedDifficulty === 'All' && statusFilter === 'All' && videoFilter === 'All') ? (
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Add First Exercise
              </button>
            ) : (
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 border rounded-md text-sm ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Category Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.slice(1).map(category => {
            const count = stats.byCategory[category] || 0;
            const activeCount = exercises.filter(ex => ex.category === category && ex.isActive !== false).length;
            const inactiveCount = count - activeCount;
            
            return (
              <div key={category} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className={`inline-block px-2 py-1 text-xs font-medium rounded mb-2 ${getCategoryColor(category)}`}>
                  {category}
                </div>
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500">
                  {activeCount} active, {inactiveCount} inactive
                </div>
              </div>
            );
          })}
        </div>

        {/* System Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Admin Exercise Management Features</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Complete Database Access:</strong> View and manage all {exercises.length} exercises including inactive ones</p>
                <p>• <strong>YouTube Integration:</strong> Direct video embedding with automatic thumbnail generation</p>
                <p>• <strong>Advanced Filtering:</strong> Filter by category, difficulty, status, and video availability</p>
                <p>• <strong>Bulk Management:</strong> Activate/deactivate exercises for user visibility</p>
                <p>• <strong>Video Coverage:</strong> {stats.videoPercentage}% of exercises have video tutorials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Coverage Progress */}
        <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Video Coverage Progress</h3>
          <div className="flex justify-between text-sm mb-2">
            <span>Videos Added: {stats.withVideo} of {stats.total}</span>
            <span>{stats.videoPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                stats.videoPercentage === 100 ? 'bg-green-500' : 
                stats.videoPercentage >= 70 ? 'bg-blue-500' : 
                stats.videoPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${stats.videoPercentage}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-600">
            <span>Need Videos: {stats.withoutVideo}</span>
            <span>Target: 100%</span>
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