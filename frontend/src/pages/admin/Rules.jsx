import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AdminRules = () => {
  const [rules, setRules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for rules - later will come from API
  useEffect(() => {
    const mockRules = [
      {
        id: 1,
        code: 'P1',
        name: 'Fat Loss',
        condition: 'B2-L2',
        description: 'IF BMI = Underweight AND Body Fat = Rendah THEN Program = P1'
      },
      {
        id: 2,
        code: 'P2',
        name: 'Muscle Gain',
        condition: 'B1-L1',
        description: 'IF BMI = Ideal AND Body Fat = Normal THEN Program = P2'
      },
      {
        id: 3,
        code: 'P3',
        name: 'Maintenance',
        condition: 'B3-L3',
        description: 'IF BMI = Overweight AND Body Fat = Tinggi THEN Program = P3'
      },
      {
        id: 4,
        code: 'P4',
        name: 'Extreme Weight Loss',
        condition: 'B3-L4',
        description: 'IF BMI = Obese AND Body Fat = Tinggi THEN Program = P4'
      },
      {
        id: 5,
        code: 'P5',
        name: 'Shred & Shape',
        condition: 'B1-L2',
        description: 'IF BMI = Underweight AND Body Fat = Normal THEN Program = P5'
      }
    ];
    setRules(mockRules);
  }, []);

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (rule) => {
    console.log('Edit rule:', rule);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus aturan ini?')) {
      setRules(prev => prev.filter(rule => rule.id !== id));
    }
  };

  const getConditionBadge = (condition) => {
    const [bmi, bodyFat] = condition.split('-');
    return (
      <div className="flex space-x-1">
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
          {bmi}
        </span>
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
          {bodyFat}
        </span>
      </div>
    );
  };

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Aturan</h1>
            <p className="text-gray-600 mt-1">Kelola aturan forward chaining untuk sistem pakar</p>
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
                placeholder="Cari aturan..."
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
              {filteredRules.map((rule, index) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {rule.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-sm text-gray-500">{rule.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getConditionBadge(rule.condition)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRules.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada aturan yang ditemukan.' : 'Belum ada data aturan.'}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Kode BMI</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <div>B1: Underweight (&lt;18.5)</div>
              <div>B2: Ideal (18.5-24.9)</div>
              <div>B3: Overweight (25-29.9)</div>
              <div>B4: Obese (≥30)</div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Kode Body Fat</h3>
            <div className="space-y-1 text-sm text-green-800">
              <div>L1: Rendah (&lt;10% Pria, &lt;20% Wanita)</div>
              <div>L2: Normal (10-20% Pria, 20-30% Wanita)</div>
              <div>L3: Tinggi (&gt;20% Pria, &gt;30% Wanita)</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-900 mb-2">Ringkasan</h3>
          <p className="text-sm text-purple-800">
            Total aturan: <span className="font-medium">{rules.length}</span> |
            Ditampilkan: <span className="font-medium">{filteredRules.length}</span>
          </p>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminRules;