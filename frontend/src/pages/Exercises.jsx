import { useState } from 'react';
import SidebarLayout from '../components/common/SidebarLayout';
import { PlayIcon } from '@heroicons/react/24/outline';

const Exercises = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock exercise data based on your table
  const exercises = [
    {
      id: 1,
      name: 'Squat',
      category: 'Leg',
      description: 'Lower body compound exercise targeting quadriceps, glutes, and hamstrings',
      sets: '3×6-8',
      videoUrl: '#'
    },
    {
      id: 2,
      name: 'Bench Press',
      category: 'Push',
      description: 'Upper body compound exercise targeting chest, shoulders, and triceps',
      sets: '3×6-8',
      videoUrl: '#'
    },
    {
      id: 3,
      name: 'Pull-Up',
      category: 'Pull',
      description: 'Upper body compound exercise targeting lats, rhomboids, and biceps',
      sets: '3×8-10',
      videoUrl: '#'
    },
    {
      id: 4,
      name: 'Deadlift',
      category: 'Full Body',
      description: 'Compound exercise targeting posterior chain muscles',
      sets: '3×6-8',
      videoUrl: '#'
    },
    {
      id: 5,
      name: 'Shoulder Press',
      category: 'Push',
      description: 'Upper body exercise targeting shoulders and triceps',
      sets: '3×8-10',
      videoUrl: '#'
    },
    {
      id: 6,
      name: 'Rows',
      category: 'Pull',
      description: 'Upper body exercise targeting middle traps, rhomboids, and rear delts',
      sets: '3×6-8',
      videoUrl: '#'
    },
    {
      id: 7,
      name: 'Leg Press',
      category: 'Leg',
      description: 'Lower body exercise targeting quadriceps and glutes',
      sets: '3×8-10',
      videoUrl: '#'
    },
    {
      id: 8,
      name: 'Triceps Pushdown',
      category: 'Push',
      description: 'Isolation exercise targeting triceps',
      sets: '3×10-15',
      videoUrl: '#'
    },
    {
      id: 9,
      name: 'Bicep Curls',
      category: 'Pull',
      description: 'Isolation exercise targeting biceps',
      sets: '3×10-15',
      videoUrl: '#'
    },
    {
      id: 10,
      name: 'Calf Raises',
      category: 'Leg',
      description: 'Lower body exercise targeting calf muscles',
      sets: '3×6-8',
      videoUrl: '#'
    },
    {
      id: 11,
      name: 'Lat Pulldown',
      category: 'Pull',
      description: 'Upper body exercise targeting latissimus dorsi',
      sets: '3×8-10',
      videoUrl: '#'
    },
    {
      id: 12,
      name: 'Cardio',
      category: 'Cardio',
      description: 'Cardiovascular exercise using treadmill or stationary bike',
      sets: '20-30 minutes',
      videoUrl: '#'
    }
  ];

  const categories = ['All', 'Push', 'Pull', 'Leg', 'Full Body', 'Cardio'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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

  return (
    <SidebarLayout>
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Gerakan Latihan
          </h1>
          
          {/* Search */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Cari:</span>
            <input
              type="text"
              placeholder="Cari gerakan latihan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExercises.map(exercise => (
            <div key={exercise.id} className="bg-white rounded-lg shadow p-6">
              {/* Video Placeholder */}
              <div className="bg-gray-200 rounded-lg h-48 mb-4 flex items-center justify-center">
                <PlayIcon className="h-12 w-12 text-gray-400" />
              </div>
              
              {/* Exercise Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {exercise.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(exercise.category)}`}>
                    {exercise.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600">
                  {exercise.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Sets/Reps: {exercise.sets}
                  </span>
                  
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <PlayIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Tidak ada gerakan latihan yang ditemukan.' 
                : 'Belum ada gerakan latihan tersedia.'}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Informasi:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Video tutorial akan segera tersedia untuk setiap gerakan</li>
            <li>• Pastikan melakukan pemanasan sebelum latihan</li>
            <li>• Konsultasikan dengan trainer jika ragu dengan teknik gerakan</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Exercises;