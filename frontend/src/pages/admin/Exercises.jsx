import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AdminExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for exercises - later will come from API
  useEffect(() => {
    const mockExercises = [
      {
        id: 1,
        name: 'Squat',
        category: 'Leg',
        videoUrl: 'https://example.com/squat.mp4',
        description: 'Gerakan dasar untuk melatih otot kaki'
      },
      {
        id: 2,
        name: 'Benchpress',
        category: 'Push',
        videoUrl: 'https://example.com/benchpress.mp4',
        description: 'Gerakan untuk melatih otot dada dan triceps'
      },
      {
        id: 3,
        name: 'Pull Down',
        category: 'Pull',
        videoUrl: 'https://example.com/pulldown.mp4',
        description: 'Gerakan untuk melatih otot punggung'
      },
      {
        id: 4,
        name: 'Rows',
        category: 'Pull',
        videoUrl: 'https://example.com/rows.mp4',
        description: 'Gerakan rowing untuk punggung tengah'
      },
      {
        id: 5,
        name: 'Barbel Curl',
        category: 'Pull',
        videoUrl: 'https://example.com/curl.mp4',
        description: 'Gerakan isolasi untuk biceps'
      }
    ];
    setExercises(mockExercises);
  }, []);

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (exercise) => {
    console.log('Edit exercise:', exercise);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus gerakan ini?')) {
      setExercises(prev => prev.filter(exercise => exercise.id !== id));
    }
  };

  const getCategoryBadgeColor = (category) => {
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
    <AdminSidebarLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Gerakan Latihan</h1>
            <p className="text-gray-600 mt-1">Kelola gerakan latihan dan video tutorial</p>
          </div>
          
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Cari:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama gerakan atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Gerakan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video Gerakan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExercises.map((exercise, index) => (
                <tr key={exercise.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-0">
                        <div className="text-sm font-medium text-gray-900">{exercise.name}</div>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryBadgeColor(exercise.category)}`}>
                            {exercise.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exercise.videoUrl ? (
                      <span className="text-green-600">✓ Ada video</span>
                    ) : (
                      <span className="text-red-600">✗ Tidak ada</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(exercise)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredExercises.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada gerakan yang ditemukan.' : 'Belum ada data gerakan.'}
              </p>
            </div>
          )}
        </div>

        {/* Category Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Push', 'Pull', 'Leg', 'Full Body', 'Cardio'].map(category => {
            const count = exercises.filter(ex => ex.category === category).length;
            return (
              <div key={category} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className={`inline-block px-2 py-1 text-xs font-medium rounded mb-2 ${getCategoryBadgeColor(category)}`}>
                  {category}
                </div>
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500">gerakan</div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Ringkasan</h3>
          <p className="text-sm text-blue-800">
            Total gerakan: <span className="font-medium">{exercises.length}</span> |
            Dengan video: <span className="font-medium">{exercises.filter(ex => ex.videoUrl).length}</span> |
            Tanpa video: <span className="font-medium">{exercises.filter(ex => !ex.videoUrl).length}</span>
          </p>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminExercises;