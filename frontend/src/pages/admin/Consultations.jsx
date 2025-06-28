import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
import { consultationService } from '../../services/consultation';
import toast from 'react-hot-toast';

const AdminConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    activeUsers: 0,
    popularProgram: null
  });

  // Fetch consultations
  useEffect(() => {
    fetchConsultations();
  }, [pagination.page, searchTerm]);

  // Fetch statistics
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const result = await consultationService.admin.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined
      });

      if (result.success) {
        setConsultations(result.data.consultations || []);
        setPagination(prev => ({
          ...prev,
          total: result.data.pagination.total,
          totalPages: result.data.pagination.totalPages
        }));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error('Gagal memuat data konsultasi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await consultationService.admin.getStats();
      if (result.success) {
        setStats({
          total: result.data.total,
          today: result.data.today,
          activeUsers: result.data.activeUsers,
          popularProgram: result.data.programStats?.[0] || null
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgramBadgeColor = (programCode) => {
    const colors = {
      'P1': 'bg-red-100 text-red-800',
      'P2': 'bg-green-100 text-green-800',
      'P3': 'bg-blue-100 text-blue-800',
      'P4': 'bg-orange-100 text-orange-800',
      'P5': 'bg-purple-100 text-purple-800'
    };
    return colors[programCode] || 'bg-gray-100 text-gray-800';
  };

  const handleViewDetail = (consultation) => {
    // TODO: Implement view detail functionality
    console.log('View detail:', consultation);
    toast.info('Detail konsultasi: ' + consultation.user.name);
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
                placeholder="Cari nama user atau email..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-96"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data konsultasi...</p>
          </div>
        ) : (
          <>
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
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BMI & Body Fat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultations.map((consultation, index) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(consultation.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {consultation.user?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {consultation.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProgramBadgeColor(consultation.program?.code)}`}>
                          {consultation.program?.code}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {consultation.program?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-sm">
                          BMI: {consultation.bmi} ({consultation.bmiDisplay})
                        </div>
                        <div className="text-sm text-gray-500">
                          Body Fat: {consultation.bodyFatPercentage}% ({consultation.bodyFatDisplay})
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleViewDetail(consultation)}
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {consultations.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? 'Tidak ada konsultasi yang ditemukan.' : 'Belum ada riwayat konsultasi.'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} konsultasi
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        pagination.page === i + 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
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
          </>
        )}

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Total Konsultasi</h3>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">Hari Ini</h3>
            <p className="text-2xl font-bold text-green-800">{stats.today}</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900">Program Populer</h3>
            <p className="text-sm font-bold text-purple-800">
              {stats.popularProgram ? stats.popularProgram.program.code : 'N/A'}
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-900">User Aktif</h3>
            <p className="text-2xl font-bold text-orange-800">{stats.activeUsers}</p>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminConsultations;