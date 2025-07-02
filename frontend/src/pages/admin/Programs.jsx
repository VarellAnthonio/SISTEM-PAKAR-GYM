import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import ProgramEditModal from '../../components/admin/ProgramEditModal';
import ProgramDetailModal from '../../components/admin/ProgramDetailModal'; // Import modal detail baru
import { MagnifyingGlassIcon, PencilIcon, EyeIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { programService } from '../../services/program';
import toast from 'react-hot-toast';

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // State untuk modal detail
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    coverage: '0%'
  });

  useEffect(() => {
    fetchPrograms();
    fetchStats();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const result = await programService.getAll();
      
      if (result.success) {
        // Sort by program code (P1, P2, P3, ...)
        const sortedPrograms = (result.data || []).sort((a, b) => {
          const numA = parseInt(a.code.replace('P', ''));
          const numB = parseInt(b.code.replace('P', ''));
          return numA - numB;
        });
        setPrograms(sortedPrograms);
      } else {
        toast.error(result.message || 'Gagal memuat data program');
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Gagal memuat data program');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await programService.admin.getStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredPrograms = programs.filter(program =>
    program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (program) => {
    setSelectedProgram(program);
    setShowEditModal(true);
  };

  // Fungsi untuk handle view detail - DIPERBAIKI
  const handleView = (program) => {
    setSelectedProgram(program);
    setShowDetailModal(true);
    
    // Toast untuk feedback
    toast.success(`Menampilkan detail program ${program.code} - ${program.name}`, {
      duration: 2000,
      position: 'top-right'
    });
  };

  const handleSave = async (formData) => {
    try {
      setSaveLoading(true);
      
      const result = await programService.admin.update(selectedProgram.id, formData);

      if (result.success) {
        toast.success('Program berhasil diperbarui');
        await fetchPrograms();
        setShowEditModal(false);
        setSelectedProgram(null);
      } else {
        throw new Error(result.message || 'Gagal memperbarui program');
      }
    } catch (error) {
      console.error('Save program error:', error);
      toast.error(error.message || 'Gagal memperbarui program');
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
      'L1': 'Rendah',
      'L2': 'Normal',
      'L3': 'Tinggi'
    };
    return mapping[category] || category;
  };

  const getProgramCardColor = (code) => {
    const colors = {
      'P1': 'border-red-200 bg-red-50',
      'P2': 'border-green-200 bg-green-50',
      'P3': 'border-blue-200 bg-blue-50',
      'P4': 'border-orange-200 bg-orange-50',
      'P5': 'border-purple-200 bg-purple-50',
      'P6': 'border-indigo-200 bg-indigo-50',
      'P7': 'border-pink-200 bg-pink-50',
      'P8': 'border-yellow-200 bg-yellow-50',
      'P9': 'border-cyan-200 bg-cyan-50',
      'P10': 'border-gray-200 bg-gray-50'
    };
    return colors[code] || 'border-gray-200 bg-gray-50';
  };

  const getCompletionStatus = (program) => {
    const requiredFields = ['name', 'description', 'cardioRatio', 'dietRecommendation', 'schedule'];
    const completedFields = requiredFields.filter(field => {
      if (field === 'schedule') {
        return program.schedule && Object.keys(program.schedule).length === 7;
      }
      return program[field] && program[field].trim();
    });
    
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  };

  if (loading) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Memuat data program...</p>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl">
        {/* Header - NO ADD BUTTON */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Program Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Kelola konten 10 program olahraga yang sudah ter-validasi secara medis
          </p>
        </div>

        {/* System Status Alert */}
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-900">Medical Logic System Optimal</h3>
              <p className="text-sm text-green-800 mt-1">
                10 program covering semua kombinasi BMI+BodyFat yang realistis. Sistem forward chaining operasional 100%.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-blue-900">Total Program</h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-800">{stats.total}</p>
            <p className="text-xs text-blue-600">medically validated</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-green-900">Coverage</h3>
            <p className="text-xl sm:text-2xl font-bold text-green-800">{stats.coverage}</p>
            <p className="text-xs text-green-600">combinations</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-purple-900">Active</h3>
            <p className="text-xl sm:text-2xl font-bold text-purple-800">{stats.active}</p>
            <p className="text-xs text-purple-600">ready for use</p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-orange-900">Complete</h3>
            <p className="text-xl sm:text-2xl font-bold text-orange-800">{stats.completionRate || 100}%</p>
            <p className="text-xs text-orange-600">content done</p>
          </div>
        </div>

        {/* Search - Mobile Friendly */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <span className="text-sm text-gray-600">Cari:</span>
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Cari program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80 text-sm sm:text-base"
              />
              <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Programs Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredPrograms.map((program) => {
            const completion = getCompletionStatus(program);
            
            return (
              <div 
                key={program.id} 
                className={`rounded-lg border-2 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 ${getProgramCardColor(program.code)}`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 sm:px-3 py-1 text-sm font-bold bg-white rounded-full shadow-sm">
                      {program.code}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      program.isActive !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {program.isActive !== false ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleView(program)}
                      className="text-gray-600 hover:text-gray-800 p-1 hover:bg-white rounded transition-colors"
                      title="Lihat Detail"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(program)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-white rounded transition-colors"
                      title="Edit Program"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Program Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base line-clamp-2">
                    {program.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{program.description}</p>
                </div>

                {/* Target Condition */}
                <div className="mb-4">
                  <div className="text-xs sm:text-sm text-gray-700 mb-2">
                    <strong>Target Kondisi:</strong>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {program.bmiCategory}
                    </span>
                    <span className="text-xs text-gray-500">+</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      {program.bodyFatCategory}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {getBMICategoryDisplay(program.bmiCategory)} + {getBodyFatCategoryDisplay(program.bodyFatCategory)}
                  </div>
                </div>

                {/* Status Info */}
                <div className="mb-4">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">
                    Status Program:
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                    {program.isActive !== false ? '✅ Program Aktif' : '❌ Program Nonaktif'}
                  </div>
                </div>

                {/* Completion Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-gray-600">Kelengkapan:</span>
                    <span className="font-medium">{completion.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        completion.percentage === 100 ? 'bg-green-500' : 
                        completion.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${completion.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
                  <button
                    onClick={() => handleView(program)}
                    className="flex-1 bg-gray-600 text-white text-xs sm:text-sm py-2 px-3 rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Detail
                  </button>
                  <button
                    onClick={() => handleEdit(program)}
                    className="flex-1 bg-blue-600 text-white text-xs sm:text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'Tidak ada program yang ditemukan.' : 'Belum ada data program.'}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Program Management - Edit Only System</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Edit Only:</strong> Sistem hanya mendukung edit konten program yang sudah ada</p>
                <p>• <strong>Medical Logic:</strong> 10 kombinasi BMI+BodyFat sudah optimal dan ter-validasi</p>
                <p>• <strong>Protected Fields:</strong> Code, BMI category, dan body fat category tidak dapat diubah</p>
                <p>• <strong>Content Focus:</strong> Edit nama, deskripsi, jadwal, diet, dan rasio kardio-beban</p>
              </div>
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