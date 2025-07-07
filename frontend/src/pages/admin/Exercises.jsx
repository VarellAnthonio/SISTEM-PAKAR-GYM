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
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { exerciseService } from '../../services/exercise';
import toast from 'react-hot-toast';

const AdminExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(12);
  
  const categories = ['All', 'Angkat Beban', 'Kardio', 'Other'];

  useEffect(() => {
    fetchAllExercises();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, statusFilter]);

  const fetchAllExercises = async () => {
    try {
      setLoading(true);
      
      const params = { 
        limit: 1000, 
        page: 1,
        includeInactive: true
      };

      const result = await exerciseService.getAll(params);
      
      if (result.success) {
        const exercisesData = result.data?.exercises || result.data || [];
        setExercises(exercisesData);
      } else {
        toast.error(result.message || 'Failed to load exercises');
      }
    } catch (error) {
      console.error('Exercise fetch error:', error);
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = !searchTerm || 
      exercise.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && exercise.isActive === true) ||
      (statusFilter === 'Inactive' && exercise.isActive === false);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

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
        await fetchAllExercises();
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
        await fetchAllExercises();
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
        const newStatus = result.data?.isActive;
        const message = newStatus ? 'Exercise activated' : 'Exercise deactivated';
        toast.success(message);
        await fetchAllExercises();
      } else {
        toast.error(result.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to toggle status');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Angkat Beban': 'bg-blue-100 text-blue-800',
      'Kardio': 'bg-red-100 text-red-800',
      'Other': 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exercises...</p>
          </div>
        </div>
      </AdminSidebarLayout>
    );
  }

  const activeExercises = exercises.filter(ex => ex.isActive === true).length;
  const inactiveExercises = exercises.filter(ex => ex.isActive === false).length;
  const withVideo = exercises.filter(ex => ex.youtubeUrl).length;

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exercise Management</h1>
            <p className="text-gray-600 mt-1">Manage exercise database with video tutorials</p>
          </div>
          
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Exercise
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <PlayIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exercises</p>
                <p className="text-2xl font-bold text-gray-900">{exercises.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeExercises}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3 mr-4">
                <XMarkIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveExercises}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <PlayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">With Video</p>
                <p className="text-2xl font-bold text-gray-900">{withVideo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstExercise + 1}-{Math.min(indexOfLastExercise, filteredExercises.length)} of {filteredExercises.length} exercises
          </p>
          {(searchTerm || selectedCategory !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setStatusFilter('All');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentExercises.map((exercise) => {
            const videoId = extractVideoId(exercise.youtubeUrl);
            
            return (
              <div key={exercise.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                  {exercise.youtubeUrl && videoId ? (
                    <div className="relative w-full h-full">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt={exercise.name}
                        className={`w-full h-full object-cover ${
                          exercise.isActive === false ? 'opacity-60' : ''
                        }`}
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <PlayIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <PlayIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No video</p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      exercise.isActive === true 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {exercise.isActive === true ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleView(exercise)}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 p-1 rounded transition-all"
                      title="View"
                    >
                      <EyeIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleEdit(exercise)}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 p-1 rounded transition-all"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">
                      {exercise.name}
                    </h3>
                  </div>

                  <div className="mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(exercise.category)}`}>
                      {exercise.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-4">
                    {exercise.description || 'No description'}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(exercise)}
                      className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(exercise)}
                      className={`flex-1 text-xs py-2 px-3 rounded-md transition-colors ${
                        exercise.isActive === true
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {exercise.isActive === true ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <PlayIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'All' || statusFilter !== 'All'
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first exercise'}
            </p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Exercise
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

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