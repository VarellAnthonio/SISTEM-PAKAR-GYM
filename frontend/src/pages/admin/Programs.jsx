import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import ProgramEditModal from '../../components/admin/ProgramEditModal';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { programService } from '../../services/program';
import toast from 'react-hot-toast';

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Fetch programs on component mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const result = await programService.getAll();
      
      if (result.success) {
        setPrograms(result.data || []);
        
        // Calculate stats
        const total = result.data?.length || 0;
        const active = result.data?.filter(p => p.isActive !== false).length || 0;
        const inactive = total - active;
        
        setStats({ total, active, inactive });
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

  // Filter programs based on search
  const filteredPrograms = programs.filter(program =>
    program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedProgram(null);
    setShowEditModal(true);
  };

  const handleEdit = (program) => {
    setSelectedProgram(program);
    setShowEditModal(true);
  };

  const handleView = (program) => {
    // For now, just show program details in console
    // Later can implement a view-only modal
    console.log('View program details:', program);
    toast.info(`Melihat detail program ${program.code}`);
  };

  const handleSave = async (formData) => {
    try {
      setSaveLoading(true);
      
      let result;
      if (selectedProgram?.id) {
        // Update existing program
        result = await programService.admin.update(selectedProgram.id, formData);
      } else {
        // Create new program
        result = await programService.admin.create(formData);
      }

      if (result.success) {
        toast.success(result.message || 'Program berhasil disimpan');
        await fetchPrograms(); // Refresh the list
        setShowEditModal(false);
      } else {
        throw new Error(result.message || 'Gagal menyimpan program');
      }
    } catch (error) {
      console.error('Save program error:', error);
      toast.error(error.message || 'Gagal menyimpan program');
      throw error; // Re-throw to be handled by modal
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (program) => {
    const confirmMessage = `Apakah Anda yakin ingin menghapus program "${program.code} - ${program.name}"?\n\nProgram yang dihapus akan dinonaktifkan dan tidak dapat digunakan untuk konsultasi baru.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const result = await programService.admin.delete(program.id);
        
        if (result.success) {
          toast.success(result.message || 'Program berhasil dihapus');
          await fetchPrograms(); // Refresh the list
        } else {
          toast.error(result.message || 'Gagal menghapus program');
        }
      } catch (error) {
        console.error('Delete program error:', error);
        toast.error('Gagal menghapus program');
      }
    }
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

  const getConditionDisplay = (program) => {
    const bmi = getBMICategoryDisplay(program.bmiCategory);
    const bodyFat = getBodyFatCategoryDisplay(program.bodyFatCategory);
    return `${bmi} + ${bodyFat}`;
  };

  if (loading) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Program Olahraga</h1>
            <p className="text-gray-600 mt-1">Kelola program olahraga P1-P10 dalam sistem</p>
          </div>
          
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Program
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Total Program</h3>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">Program Aktif</h3>
            <p className="text-2xl font-bold text-green-800">{stats.active}</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-900">Program Nonaktif</h3>
            <p className="text-2xl font-bold text-red-800">{stats.inactive}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Cari:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari program..."
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
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kondisi Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rasio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {program.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{program.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {program.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-1">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          {getBMICategoryDisplay(program.bmiCategory)}
                        </span>
                        <span className="text-xs text-gray-500">+</span>
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                          {getBodyFatCategoryDisplay(program.bodyFatCategory)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {program.cardioRatio || 'Belum diatur'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        program.isActive !== false 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {program.isActive !== false ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleView(program)}
                        className="text-gray-600 hover:text-gray-800 font-medium inline-flex items-center"
                        title="Lihat Detail"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Detail
                      </button>
                      <button
                        onClick={() => handleEdit(program)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                        title="Edit Program"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(program)}
                        className="text-red-600 hover:text-red-800 font-medium inline-flex items-center"
                        title="Hapus Program"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(program)}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(program)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(program)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900">{program.name}</div>
                  <div className="text-sm text-gray-500">{program.description}</div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Kondisi:</strong> {getConditionDisplay(program)}
                </div>
                
                <div className="text-sm text-gray-600">
                  <strong>Rasio:</strong> {program.cardioRatio || 'Belum diatur'}
                </div>
              </div>
            ))}
          </div>
          
          {filteredPrograms.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada program yang ditemukan.' : 'Belum ada data program.'}
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Ringkasan</h3>
          <p className="text-sm text-blue-800">
            Total program: <span className="font-medium">{programs.length}</span> |
            Ditampilkan: <span className="font-medium">{filteredPrograms.length}</span> |
            Aktif: <span className="font-medium text-green-700">{stats.active}</span> |
            Nonaktif: <span className="font-medium text-red-700">{stats.inactive}</span>
          </p>
        </div>

        {/* Edit Modal */}
        <ProgramEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          program={selectedProgram}
          onSave={handleSave}
          loading={saveLoading}
        />
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminPrograms;