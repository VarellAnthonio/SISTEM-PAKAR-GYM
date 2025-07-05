import { useState, useEffect } from 'react';
import { XMarkIcon, PlayIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import YouTubePlayer from './YouTubePlayer';

const ExerciseModal = ({ 
  isOpen, 
  onClose, 
  exercise, 
  onSave, 
  onDelete,
  loading = false,
  mode = 'view' // 'view', 'edit', 'create'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    instructions: '',
    sets: '',
    duration: '',
    difficulty: 'Beginner',
    youtubeUrl: '',
    muscleGroups: [],
    equipment: [],
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [newEquipment, setNewEquipment] = useState('');

  const categories = ['Push', 'Pull', 'Leg', 'Full Body', 'Cardio'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const commonMuscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
    'Abs', 'Obliques', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves',
    'Upper Traps', 'Middle Traps', 'Lower Traps', 'Lats', 'Rhomboids',
    'Rear Delts', 'Front Delts', 'Side Delts'
  ];

  const commonEquipment = [
    'Barbell', 'Dumbbell', 'Kettlebell', 'Cable Machine', 'Pull-up Bar',
    'Bench', 'Incline Bench', 'Decline Bench', 'Squat Rack', 'Leg Press Machine',
    'Lat Pulldown Machine', 'Seated Row Machine', 'Leg Curl Machine',
    'Leg Extension Machine', 'Calf Raise Machine', 'Smith Machine',
    'Treadmill', 'Stationary Bike', 'Elliptical', 'Rowing Machine',
    'Resistance Bands', 'Bodyweight', 'Medicine Ball', 'Stability Ball'
  ];

  // Initialize form data when exercise changes
  useEffect(() => {
    if (exercise && isOpen) {
      setFormData({
        name: exercise.name || '',
        category: exercise.category || '',
        description: exercise.description || '',
        instructions: exercise.instructions || '',
        sets: exercise.sets || '',
        duration: exercise.duration || '',
        difficulty: exercise.difficulty || 'Beginner',
        youtubeUrl: exercise.youtubeUrl || '',
        muscleGroups: exercise.muscleGroups || [],
        equipment: exercise.equipment || [],
        isActive: exercise.isActive !== undefined ? exercise.isActive : true
      });
      setErrors({});
      setHasChanges(false);
      setActiveTab('info');
    }
  }, [exercise, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        category: '',
        description: '',
        instructions: '',
        sets: '',
        duration: '',
        difficulty: 'Beginner',
        youtubeUrl: '',
        muscleGroups: [],
        equipment: [],
        isActive: true
      });
      setErrors({});
      setHasChanges(false);
      setActiveTab('info');
      setNewMuscleGroup('');
      setNewEquipment('');
    }
  }, [isOpen]);

  // Track changes
  useEffect(() => {
    if (exercise && mode === 'edit') {
      const hasChanged = 
        formData.name !== (exercise.name || '') ||
        formData.category !== (exercise.category || '') ||
        formData.description !== (exercise.description || '') ||
        formData.instructions !== (exercise.instructions || '') ||
        formData.sets !== (exercise.sets || '') ||
        formData.duration !== (exercise.duration || '') ||
        formData.difficulty !== (exercise.difficulty || 'Beginner') ||
        formData.youtubeUrl !== (exercise.youtubeUrl || '') ||
        formData.isActive !== (exercise.isActive !== undefined ? exercise.isActive : true) ||
        JSON.stringify(formData.muscleGroups) !== JSON.stringify(exercise.muscleGroups || []) ||
        JSON.stringify(formData.equipment) !== JSON.stringify(exercise.equipment || []);
      
      setHasChanges(hasChanged);
    } else if (mode === 'create') {
      const hasContent = formData.name.trim() || formData.category || formData.description.trim();
      setHasChanges(hasContent);
    }
  }, [formData, exercise, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddMuscleGroup = () => {
    const muscle = newMuscleGroup.trim();
    if (muscle && !formData.muscleGroups.includes(muscle)) {
      setFormData(prev => ({
        ...prev,
        muscleGroups: [...prev.muscleGroups, muscle]
      }));
      setNewMuscleGroup('');
    }
  };

  const handleRemoveMuscleGroup = (muscle) => {
    setFormData(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.filter(m => m !== muscle)
    }));
  };

  const handleAddEquipment = () => {
    const equip = newEquipment.trim();
    if (equip && !formData.equipment.includes(equip)) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, equip]
      }));
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (equip) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(e => e !== equip)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Exercise name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Exercise name must be at least 2 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.youtubeUrl && !isValidYouTubeUrl(formData.youtubeUrl)) {
      newErrors.youtubeUrl = 'Invalid YouTube URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      onDelete(exercise.id);
    }
  };

  const handleClose = () => {
    if (hasChanges && (mode === 'edit' || mode === 'create')) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
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

  if (!isOpen) return null;

  const videoId = extractVideoId(formData.youtubeUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-4 mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'create' ? 'Add New Exercise' :
                 mode === 'edit' ? 'Edit Exercise' : 'Exercise Details'}
              </h2>
              {exercise && (
                <p className="text-sm text-gray-600 mt-1">
                  {exercise.name} - {exercise.category}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Exercise Info
              </button>
              {formData.youtubeUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'video'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <PlayIcon className="h-4 w-4 inline mr-1" />
                  Video
                </button>
              )}
            </nav>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exercise Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        } ${mode === 'view' ? 'bg-gray-50' : ''}`}
                        placeholder="Push-ups"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.category ? 'border-red-300' : 'border-gray-300'
                        } ${mode === 'view' ? 'bg-gray-50' : ''}`}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>
                  </div>

                  {/* Exercise Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sets/Reps
                      </label>
                      <input
                        type="text"
                        name="sets"
                        value={formData.sets}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          mode === 'view' ? 'bg-gray-50' : ''
                        }`}
                        placeholder="3×8-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          mode === 'view' ? 'bg-gray-50' : ''
                        }`}
                        placeholder="30 minutes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          mode === 'view' ? 'bg-gray-50' : ''
                        }`}
                      >
                        {difficulties.map(diff => (
                          <option key={diff} value={diff}>{diff}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* YouTube URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      name="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={handleChange}
                      disabled={mode === 'view'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.youtubeUrl ? 'border-red-300' : 'border-gray-300'
                      } ${mode === 'view' ? 'bg-gray-50' : ''}`}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {errors.youtubeUrl && (
                      <p className="mt-1 text-sm text-red-600">{errors.youtubeUrl}</p>
                    )}
                    {formData.youtubeUrl && videoId && (
                      <p className="mt-1 text-sm text-green-600">✓ Valid YouTube URL</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={mode === 'view'}
                      rows={3}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        mode === 'view' ? 'bg-gray-50' : ''
                      }`}
                      placeholder="Brief description of the exercise..."
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      disabled={mode === 'view'}
                      rows={4}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        mode === 'view' ? 'bg-gray-50' : ''
                      }`}
                      placeholder="Step by step instructions..."
                    />
                  </div>

                  {/* Muscle Groups */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Muscle Groups
                    </label>
                    
                    {/* Add new muscle group */}
                    {mode !== 'view' && (
                      <div className="flex gap-2 mb-3">
                        <select
                          value={newMuscleGroup}
                          onChange={(e) => setNewMuscleGroup(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select muscle group</option>
                          {commonMuscleGroups
                            .filter(muscle => !formData.muscleGroups.includes(muscle))
                            .map(muscle => (
                              <option key={muscle} value={muscle}>{muscle}</option>
                            ))
                          }
                        </select>
                        <button
                          type="button"
                          onClick={handleAddMuscleGroup}
                          disabled={!newMuscleGroup}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {/* Selected muscle groups */}
                    <div className="flex flex-wrap gap-2">
                      {formData.muscleGroups.map(muscle => (
                        <span
                          key={muscle}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          {muscle}
                          {mode !== 'view' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMuscleGroup(muscle)}
                              className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment
                    </label>
                    
                    {/* Add new equipment */}
                    {mode !== 'view' && (
                      <div className="flex gap-2 mb-3">
                        <select
                          value={newEquipment}
                          onChange={(e) => setNewEquipment(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select equipment</option>
                          {commonEquipment
                            .filter(equip => !formData.equipment.includes(equip))
                            .map(equip => (
                              <option key={equip} value={equip}>{equip}</option>
                            ))
                          }
                        </select>
                        <button
                          type="button"
                          onClick={handleAddEquipment}
                          disabled={!newEquipment}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {/* Selected equipment */}
                    <div className="flex flex-wrap gap-2">
                      {formData.equipment.map(equip => (
                        <span
                          key={equip}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                        >
                          {equip}
                          {mode !== 'view' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveEquipment(equip)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  {mode !== 'view' && (
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active Exercise</span>
                      </label>
                    </div>
                  )}

                  {/* View Mode Summary */}
                  {mode === 'view' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Exercise Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${getCategoryColor(formData.category)}`}>
                            {formData.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Difficulty:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${getDifficultyColor(formData.difficulty)}`}>
                            {formData.difficulty}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Sets/Reps:</span>
                          <span className="ml-2 font-medium">{formData.sets || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-medium">{formData.duration || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Video Tab */}
              {activeTab === 'video' && formData.youtubeUrl && videoId && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-900">Exercise Video</h3>
                        <p className="text-sm text-blue-800 mt-1">
                          Watch the demonstration video to learn proper form and technique.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <YouTubePlayer
                    videoId={videoId}
                    title={formData.name}
                    className="w-full h-96"
                  />
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Video Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Exercise:</strong> {formData.name}</p>
                      <p><strong>Video ID:</strong> {videoId}</p>
                      <p><strong>URL:</strong> <a href={formData.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{formData.youtubeUrl}</a></p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {mode === 'edit' && hasChanges && (
                  <span className="text-orange-600 font-medium">● Unsaved changes</span>
                )}
                {mode === 'create' && hasChanges && (
                  <span className="text-blue-600 font-medium">● Ready to save</span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {mode === 'view' && exercise && onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Delete Exercise
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {mode === 'view' ? 'Close' : 'Cancel'}
                </button>
                
                {(mode === 'edit' || mode === 'create') && (
                  <button
                    type="submit"
                    disabled={loading || !hasChanges}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      mode === 'create' ? 'Add Exercise' : 'Save Changes'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;