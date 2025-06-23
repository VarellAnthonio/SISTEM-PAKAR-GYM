import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

const AdminConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for consultations - later will come from API
  useEffect(() => {
    const mockConsultations = [
      {
        id: 1,
        date: '2024-01-15',
        user: 'John Doe',
        program: 'Fat Loss',
        bmi: 'Underweight',
        bodyFat: 'Rendah',
        email: 'john@example.com'
      },
      {
        id: 2,
        date: '2024-01-14',
        user: 'Jane Smith',
        program: 'Muscle Gain',
        bmi: 'Ideal',
        bodyFat: 'Normal',
        email: 'jane@example.com'
      },
      {
        id: 3,
        date: '2024-01-13',
        user: 'Bob Wilson',
        program: 'Maintenance',
        bmi: 'Overweight',
        bodyFat: 'Tinggi',
        email: 'bob@example.com'
      },
      {
        id: 4,
        date: '2024-01-12',
        user: 'Alice Brown',
        program: 'Extreme Weight Loss',
        bmi: 'Obese',
        bodyFat: 'Tinggi',
        email: 'alice@example.com'
      },
      {
        id: 5,
        date: '2024-01-11',
        user: 'Charlie Davis',
        program: 'Shred & Shape',
        bmi: 'Underweight',
        bodyFat: 'Normal',
        email: 'charlie@example.com'
      }
    ];
    setConsultations(mockConsultations);
  }, []);

  const filteredConsultations = consultations.filter(consultation =>
    consultation.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.bmi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.bodyFat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetail = (consultation) => {
    console.log('View detail:', consultation);
    // TODO: Implement view detail functionality
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus riwayat konsultasi ini?')) {
      setConsultations(prev => prev.filter(item => item.id !== id));
    }
  };

  const getProgramBadgeColor = (program) => {
    const colors = {
      'Fat Loss': 'bg-red-100 text-red-800',
      'Muscle Gain': 'bg-green-100 text-green-800',
      'Maintenance': 'bg-blue-100 text-blue-800',
      'Extreme Weight Loss': 'bg-orange-100 text-orange-800',
      'Shred & Shape': 'bg-purple-100 text-purple-800'
    };
    return colors[program] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Konsultasi</h1>
            <p className="text-gray-600 mt-1">Kelola semua riwayat konsultasi pengguna</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Cari:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama user, program, atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-96"
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
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConsultations.map((consultation, index) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(consultation.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{consultation.user}</div>
                      <div className="text-sm text-gray-500">{consultation.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProgramBadgeColor(consultation.program)}`}>
                      {consultation.program}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      BMI: {consultation.bmi} | Body Fat: {consultation.bodyFat}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleViewDetail(consultation)}
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredConsultations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada konsultasi yang ditemukan.' : 'Belum ada riwayat konsultasi.'}
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Total Konsultasi</h3>
            <p className="text-2xl font-bold text-blue-800">{consultations.length}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">Hari Ini</h3>
            <p className="text-2xl font-bold text-green-800">
              {consultations.filter(c => c.date === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900">Program Populer</h3>
            <p className="text-sm font-bold text-purple-800">Fat Loss</p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-900">User Aktif</h3>
            <p className="text-2xl font-bold text-orange-800">
              {new Set(consultations.map(c => c.user)).size}
            </p>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminConsultations;