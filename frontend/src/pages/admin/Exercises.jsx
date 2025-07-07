// frontend/src/pages/admin/Exercises.jsx - SIMPLIFIED VERSION
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
  ExclamationTriangleIcon
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
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(12);
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withVideo: 0,
    withoutVideo: 0,
    videoPercentage: 0,
    byCategory: {}
  });

  // SIMPLIFIED CATEGORIES
  const categories = ['All', 'Angkat Beban', 'Kardio', 'Other'];
  const statusOptions = ['All', 'Active', 'Inactive'];

  useEffect(() => {
    console.log('🔄 Admin Exercise page mounted, fetching exercises...');
    fetchAllExercises();
  }, []);

  useEffect(() => {
    filterExercises();
    setCurrentPage(1);
  }, [exercises, searchTerm, selectedCategory, statusFilter]);

  const fetchAllExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { limit: 1000, page: 1 };
      const result = await exerciseService.getAll(params);
      
      if (result.success) {
        const exercisesData = result.data?.exercises || result.data || [];
        console.log('✅ Total exercises loaded:', exercisesData.length);
        
        setExercises(exercisesData);
        calculateStats(exercisesData);
      } else {
        setError(result.message || 'Failed to load exercises');
        toast.error(result.message || 'Failed to load exercises');
      }
    } catch (error) {
      console.error('💥 Exercise fetch error:', error);
      setError(error.message || 'Failed to load exercises');
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = [...exercises];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(exercise => 
        exercise.name?.toLowerCase().includes(searchLower) ||
        exercise.description?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'Active') {
        filtered = filtered.filter(exercise => exercise.isActive !== false);
      } else if (statusFilter === 'Inactive') {
        filtered = filtered.filter(exercise => exercise.isActive === false);
      }
    }

    setFilteredExercises(filtered);
  };

  const calculateStats = (exercisesData) => {
    const active = exercisesData.filter(ex => ex.isActive !== false).length;
    const inactive = exercisesData.filter(ex => ex.isActive === false).length;
    const withVideo = exercisesData.filter(ex => ex.youtubeUrl).length;
    const withoutVideo = exercisesData.length - withVideo;
    const videoPercentage = exercisesData.length > 0 ? Math.round((withVideo / exercisesData.length) * 100) : 0;
    
    const byCategory = {};
    exercisesData.forEach(exercise => {
      byCategory[exercise.category] = (byCategory[exercise.category] || 0) + 1;
    });

    setStats({
      total: exercisesData.length,
      active,
      inactive,
      withVideo,
      withoutVideo,
      videoPercentage,
      byCategory
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
        toast.success(modalMode === 'create' ? 'Gerakan berhasil ditambahkan' : 'Gerakan berhasil diperbarui');
        await fetchAllExercises();
        setShowModal(false);
        setSelectedExercise(null);
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Gagal menyimpan gerakan');
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (exerciseId) => {
    if (!window.confirm('Yakin ingin menghapus gerakan ini?')) {
      return;
    }

    try {
      const result = await exerciseService.delete(exerciseId);
      
      if (result.success) {
        toast.success('Gerakan berhasil dihapus');
        await fetchAllExercises();
        setShowModal(false);
        setSelectedExercise(null);
      } else {
        toast.error(result.message || 'Gagal menghapus gerakan');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Gagal menghapus gerakan');
    }
  };

  const handleToggleStatus = async (exercise) => {
    try {
      const result = await exerciseService.toggleStatus(exercise.id);
      
      if (result.success) {
        toast.success(`Gerakan ${exercise.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
        await fetchAllExercises();
      } else {
        toast.error(result.message || 'Gagal mengubah status gerakan');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Gagal mengubah status gerakan');
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

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setStatusFilter('All');
  };

  // Error state
  if (error && !loading && exercises.length === 0) {
    return (
      <AdminSidebarLayout>
        <div className="max-w-7xl">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchAllExercises();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Coba Lagi
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
              <p className="text-gray-600">Memuat data gerakan latihan...</p>
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Kelola Gerakan Latihan</h1>
            <p className="text-gray-600 mt-1">Kelola database gerakan latihan dengan mudah</p>
          </div>
          
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Gerakan
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Total Gerakan</h3>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
            <p className="text-xs text-blue-600">gerakan tersedia</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">Aktif</h3>
            <p className="text-2xl font-bold text-green-800">{stats.active}</p>
            <p className="text-xs text-green-600">dapat dilihat user</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-900">Nonaktif</h3>
            <p className="text-2xl font-bold text-red-800">{stats.inactive}</p>
            <p className="text-xs text-red-600">disembunyikan</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900">Ada Video</h3>
            <p className="text-2xl font-bold text-purple-800">{stats.withVideo}</p>
            <p className="text-xs text-purple-600">{stats.videoPercentage}% coverage</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari gerakan..."
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
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'All' || statusFilter !== 'All') && (
            <div className="mt-4">
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Hapus semua filter
              </button>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Menampilkan {indexOfFirstExercise + 1}-{Math.min(indexOfLastExercise, filteredExercises.length)} dari {filteredExercises.length} gerakan
          </p>
          <p className="text-sm text-gray-500">
            Halaman {currentPage} dari {totalPages}
          </p>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {currentExercises.map((exercise) => {
            const videoId = extractVideoId(exercise.youtubeUrl);
            
            return (
              <div key={exercise.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                  {exercise.youtubeUrl && videoId ? (
                    <div className="relative w-full h-full">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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
                      <p className="text-sm text-gray-500">Tidak ada video</p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      exercise.isActive !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {exercise.isActive !== false ? 'Aktif' : 'Nonaktif'}
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
                        title="Lihat Detail"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(exercise)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Gerakan"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Hapus Gerakan"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(exercise.category)}`}>
                      {exercise.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {exercise.description || 'Tidak ada deskripsi'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className={`inline-flex items-center ${exercise.youtubeUrl ? 'text-green-600' : 'text-orange-600'}`}>
                      {exercise.youtubeUrl ? '✓ Ada video' : '○ Tidak ada video'}
                    </span>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex space-x-2">
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
                      {exercise.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredExercises.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="mb-4">
              <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada gerakan ditemukan
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'All' || statusFilter !== 'All'
                ? 'Coba ubah filter pencarian' 
                : 'Mulai dengan menambahkan gerakan pertama'}
            </p>
            {(!searchTerm && selectedCategory === 'All' && statusFilter === 'All') ? (
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Tambah Gerakan Pertama
              </button>
            ) : (
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Hapus Semua Filter
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
              Sebelumnya
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
              Selanjutnya
            </button>
          </div>
        )}

        {/* Category Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {activeCount} aktif, {inactiveCount} nonaktif
                </div>
              </div>
            );
          })}
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