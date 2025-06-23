import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for programs - later will come from API
  useEffect(() => {
    const mockPrograms = [
      {
        id: 1,
        code: 'P1',
        name: 'Fat Loss',
        description: 'Program untuk menurunkan lemak tubuh dengan kombinasi kardio dan beban',
        condition: 'Underweight + Rendah'
      },
      {
        id: 2,
        code: 'P2',
        name: 'Muscle Gain',
        description: 'Program untuk menambah massa otot dengan fokus latihan beban',
        condition: 'Ideal + Normal'
      },
      {
        id: 3,
        code: 'P3',
        name: 'Maintenance',
        description: 'Program pemeliharaan untuk menjaga kondisi tubuh ideal',
        condition: 'Overweight + Tinggi'
      },
      {
        id: 4,
        code: 'P4',
        name: 'Extreme Weight Loss',
        description: 'Program intensif untuk penurunan berat badan yang signifikan',
        condition: 'Obese + Tinggi'
      },
      {
        id: 5,
        code: 'P5',
        name: 'Shred & Shape',
        description: 'Program untuk membentuk otot sambil membakar lemak',
        condition: 'Underweight + Normal'
      }
    ];
    setPrograms(mockPrograms);
  }, []);

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (program) => {
    console.log('Edit program:', program);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus program ini?')) {
      setPrograms(prev => prev.filter(program => program.id !== id));
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Program Olahraga</h1>
            <p className="text-gray-600 mt-1">Kelola program olahraga yang tersedia dalam sistem</p>
          </div>
          
          <button
            onClick={handleAdd}
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
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kondisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrograms.map((program, index) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {program.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{program.name}</div>
                        <div className="text-sm text-gray-500">{program.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {program.condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(program)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
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
            {filteredPrograms.map((program, index) => (
              <div key={program.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {program.code}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(program)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900">{program.name}</div>
                  <div className="text-sm text-gray-500">{program.description}</div>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Kondisi:</strong> {program.condition}
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
            Ditampilkan: <span className="font-medium">{filteredPrograms.length}</span>
          </p>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminPrograms;