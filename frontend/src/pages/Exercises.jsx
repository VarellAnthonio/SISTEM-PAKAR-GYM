import { useState, useEffect } from 'react';
import SidebarLayout from '../components/common/SidebarLayout';
import ExerciseModal from '../components/exercise/ExerciseModal';
import { 
  PlayIcon, 
  MagnifyingGlassIcon, 
  EyeIcon,
  StarIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { exerciseService } from '../services/exercise';
import toast from 'react-hot-toast';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

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
    fetchExercises();
    loadFavorites();
  }, [pagination.page, selectedCategory, selectedDifficulty, selectedMuscleGroup]);

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
        ...(selectedDifficulty !== 'All' && { difficulty: selectedDifficulty }),
        ...(selectedMuscleGroup !== 'All' && { muscleGroup: selectedMuscleGroup })
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
      byCategory,
      byDifficulty
    });
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

  const saveFavorites = (newFavorites) => {
    try {
      localStorage.setItem('exercise_favorites', JSON.stringify([...newFavorites]));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
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
    saveFavorites(newFavorites);
  };

  const handleView = (exercise) => {
    setSelectedExercise(exercise);
    setShowModal(true);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Push': 'bg-red-100 text-red-800 border-red-200',
      'Pull': 'bg-blue-100 text-blue-800 border-blue-200',
      'Leg': 'bg-green-100 text-green-800 border-green-200',
      'Full Body': 'bg-purple-100 text-purple-800 border-purple-200',
      'Cardio': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return <StarIcon className="h-3 w-3" />;
      case 'Intermediate':
        return (
          <div className="flex">
            <StarIcon className="h-3 w-3" />
            <StarIcon className="h-3 w-3" />
          </div>
        );
      case 'Advanced':
        return (
          <div className="flex">
            <StarIcon className="h-3 w-3" />
            <StarIcon className="h-3 w-3" />
            <StarIcon className="h-3 w-3" />
          </div>
        );
      default:
        return <StarIcon className="h-3 w-3" />;
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    if (selectedMuscleGroup !== 'All') {
      return exercise.muscleGroups?.includes(selectedMuscleGroup);
    }
    return true;
  });

  if (loading && exercises.length === 0) {
    return (
      <SidebarLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading exercises...</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
            Exercise Library
          </h1>
          <p className="text-gray-600">
            Discover exercises with video tutorials to enhance your workout routine
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
                  <p className="text-sm font-medium text-orange-900">5</p>
                  <p className="text-xs text-orange-600">Categories</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
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
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
              {/* Video Thumbnail */}
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {exercise.youtubeUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={`https://img.youtube.com/vi/${exerciseService.utils.extractVideoId(exercise.youtubeUrl)}/maxresdefault.jpg`}
                      alt={exercise.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${exerciseService.utils.extractVideoId(exercise.youtubeUrl)}/hqdefault.jpg`;
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
                  <div className={`flex items-center px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(exercise.difficulty)}`}>
                    {getDifficultyIcon(exercise.difficulty)}
                    <span className="ml-1">{exercise.difficulty}</span>
                  </div>
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
          ))}
        </div>

        {/* Empty State */}
        {filteredExercises.length === 0 && !loading && (
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
            {(searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All' || selectedMuscleGroup !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                  setSelectedMuscleGroup('All');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Clear Filters
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

        {/* Exercise Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Exercise Tips</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Watch videos first:</strong> Learn proper form before starting</p>
            <p>• <strong>Start with basics:</strong> Choose beginner exercises if you're new</p>
            <p>• <strong>Save favorites:</strong> Create your personal exercise collection</p>
            <p>• <strong>Progressive overload:</strong> Gradually increase difficulty over time</p>
            <p>• <strong>Rest periods:</strong> Allow proper recovery between sets</p>
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
          mode="view"
        />
      </div>
    </SidebarLayout>
  );
};

export default Exercises;