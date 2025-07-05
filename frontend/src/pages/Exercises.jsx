// frontend/src/pages/Exercises.jsx - FIXED VERSION (Load All Exercises)
import { useState, useEffect } from 'react';
import SidebarLayout from '../components/common/SidebarLayout';
import ExerciseModal from '../components/exercise/ExerciseModal';
import { 
  PlayIcon, 
  MagnifyingGlassIcon, 
  EyeIcon,
  StarIcon,
  ClockIcon,
  FireIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { exerciseService } from '../services/exercise';
import toast from 'react-hot-toast';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Pagination for display (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(9); // Show more per page
  
  const [favorites, setFavorites] = useState(new Set());
  const [stats, setStats] = useState({
    total: 0,
    withVideo: 0,
    byCategory: {},
    byDifficulty: {}
  });

  const categories = ['All', 'Push', 'Pull', 'Leg', 'Full Body', 'Cardio'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const muscleGroups = [
    'All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Lats'
  ];

  useEffect(() => {
    console.log('🔄 Exercise page mounted, fetching ALL exercises...');
    fetchAllExercises();
    loadFavorites();
  }, []);

  // Filter exercises when search/filters change
  useEffect(() => {
    filterExercises();
    setCurrentPage(1); // Reset to first page when filters change
  }, [exercises, searchTerm, selectedCategory, selectedDifficulty, selectedMuscleGroup]);

  const fetchAllExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching ALL exercises (no pagination limit)...');

      // Fetch ALL exercises by setting a high limit
      const params = {
        limit: 1000, // High limit to get all exercises
        page: 1
      };

      const result = await exerciseService.getAll(params);
      
      console.log('📥 Exercise API result:', result);
      
      if (result.success) {
        const exercisesData = result.data?.exercises || result.data || [];
        console.log('✅ Total exercises loaded:', exercisesData.length);
        
        setExercises(exercisesData);
        calculateStats(exercisesData);
      } else {
        console.error('❌ Exercise API failed:', result.message);
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

    if (selectedMuscleGroup !== 'All') {
      filtered = filtered.filter(exercise => 
        exercise.muscleGroups?.includes(selectedMuscleGroup)
      );
    }

    console.log('🔍 Filtered exercises:', filtered.length, 'from total:', exercises.length);
    setFilteredExercises(filtered);
  };

  const calculateStats = (exercisesData) => {
    console.log('📊 Calculating stats for exercises:', exercisesData.length);
    
    const withVideo = exercisesData.filter(ex => ex.youtubeUrl || ex.videoUrl).length;
    const byCategory = {};
    const byDifficulty = {};

    exercisesData.forEach(exercise => {
      byCategory[exercise.category] = (byCategory[exercise.category] || 0) + 1;
      byDifficulty[exercise.difficulty] = (byDifficulty[exercise.difficulty] || 0) + 1;
    });

    const newStats = {
      total: exercisesData.length,
      withVideo,
      byCategory,
      byDifficulty
    };

    console.log('📈 Stats calculated:', newStats);
    setStats(newStats);
  };

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('exercise_favorites');
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = (exerciseId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(exerciseId)) {
      newFavorites.delete(exerciseId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(exerciseId);
      toast.success('Added to favorites');
    }
    
    try {
      localStorage.setItem('exercise_favorites', JSON.stringify([...newFavorites]));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const handleView = (exercise) => {
    console.log('👁️ Viewing exercise:', exercise);
    setSelectedExercise(exercise);
    setShowModal(true);
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

  // Safe video ID extraction
  const extractVideoId = (url) => {
    try {
      return exerciseService.utils.extractVideoId(url);
    } catch (error) {
      console.warn('Failed to extract video ID from:', url, error);
      return null;
    }
  };

  const getCategoryColor = (category) => {
    return exerciseService.utils.getCategoryColor(category);
  };

  const getDifficultyColor = (difficulty) => {
    return exerciseService.utils.getDifficultyColor(difficulty);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedMuscleGroup('All');
  };

  // Error state
  if (error && !loading && exercises.length === 0) {
    return (
      <SidebarLayout>
        <div className="max-w-7xl mx-auto">
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
      </SidebarLayout>
    );
  }

  // Loading state
  if (loading && exercises.length === 0) {
    return (
      <SidebarLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading all exercises...</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-900">📊 Exercise Library Status</h4>
            <div className="mt-1 text-xs text-green-800 space-y-1">
              <p>• <strong>Total exercises loaded:</strong> {exercises.length}</p>
              <p>• <strong>After filters:</strong> {filteredExercises.length}</p>
              <p>• <strong>Showing on page:</strong> {currentExercises.length} (Page {currentPage} of {totalPages})</p>
              <p>• <strong>With video:</strong> {stats.withVideo}</p>
              <p>• <strong>Categories:</strong> {Object.entries(stats.byCategory).map(([cat, count]) => `${cat}: ${count}`).join(', ')}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
            Exercise Library
          </h1>
          <p className="text-gray-600">
            Complete collection of exercises with video tutorials - Total: {exercises.length} exercises
          </p>
          
          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <PlayIcon className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{stats.total}</p>
                  <p className="text-xs text-blue-600">Total Exercises</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <PlayIcon className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">{stats.withVideo}</p>
                  <p className="text-xs text-green-600">With Videos</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-purple-900">{favorites.size}</p>
                  <p className="text-xs text-purple-600">Favorites</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center">
                <FireIcon className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-orange-900">{filteredExercises.length}</p>
                  <p className="text-xs text-orange-600">After Filters</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
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
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
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
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'All' ? 'All Levels' : difficulty}
                  </option>
                ))}
              </select>
            </div>

            {/* Muscle Group Filter */}
            <div>
              <select
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {muscleGroups.map(muscle => (
                  <option key={muscle} value={muscle}>
                    {muscle === 'All' ? 'All Muscles' : muscle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All' || selectedMuscleGroup !== 'All') && (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {currentExercises.map((exercise) => {
            const videoId = extractVideoId(exercise.youtubeUrl);
            
            return (
              <div key={exercise.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  {exercise.youtubeUrl && videoId ? (
                    <div className="relative w-full h-full">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt={exercise.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <PlayIcon className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Video
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No video</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(exercise.id);
                    }}
                    className="absolute top-2 left-2 p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
                  >
                    <StarIcon 
                      className={`h-4 w-4 ${
                        favorites.has(exercise.id) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-400'
                      }`} 
                    />
                  </button>
                </div>

                {/* Exercise Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">
                      {exercise.name}
                    </h3>
                    <button
                      onClick={() => handleView(exercise)}
                      className="ml-2 text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getCategoryColor(exercise.category)}`}>
                      {exercise.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {exercise.description || 'No description available'}
                  </p>

                  {/* Exercise Details */}
                  <div className="space-y-2">
                    {exercise.sets && (
                      <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        <span>Sets: {exercise.sets}</span>
                      </div>
                    )}
                    
                    {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscleGroups.slice(0, 2).map(muscle => (
                          <span key={muscle} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            {muscle}
                          </span>
                        ))}
                        {exercise.muscleGroups.length > 2 && (
                          <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            +{exercise.muscleGroups.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => handleView(exercise)}
                    className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    View Exercise
                  </button>
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
              No exercises found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All' || selectedMuscleGroup !== 'All'
                ? 'Try adjusting your search or filter criteria' 
                : 'No exercises available at the moment'}
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Clear All Filters
            </button>
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

        {/* Exercise Modal */}
        <ExerciseModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedExercise(null);
          }}
          exercise={selectedExercise}
          mode="view"
        />
      </div>
    </SidebarLayout>
  );
};

export default Exercises;