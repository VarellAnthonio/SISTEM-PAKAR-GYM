import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { MagnifyingGlassIcon, EyeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { consultationService } from '../../services/consultation';
import toast from 'react-hot-toast';

const AdminConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  }, [pagination.page]);

  // Fetch statistics
  useEffect(() => {
    fetchStats();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page === 1) {
        fetchConsultations();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Admin fetching consultations with params:', {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });

      const result = await consultationService.admin.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm })
      });

      console.log('Admin API Result:', result);

      if (result && result.success) {
        const consultationsData = result.data?.consultations || result.data || [];
        setConsultations(Array.isArray(consultationsData) ? consultationsData : []);
        
        if (result.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            total: result.data.pagination.total || 0,
            totalPages: result.data.pagination.totalPages || 0
          }));
        }
      } else {
        console.error('Admin API returned unsuccessful result:', result);
        setError(result?.message || 'Gagal memuat data konsultasi');
        setConsultations([]);
      }
    } catch (error) {
      console.error('Error fetching admin consultations:', error);
      setError('Gagal terhubung ke server');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await consultationService.admin.getStats();
      
      console.log('Admin Stats Result:', result);
      
      if (result && result.success && result.data) {
        setStats({
          total: result.data.total || 0,
          today: result.data.today || 0,
          activeUsers: result.data.activeUsers || 0,
          popularProgram: result.data.programStats?.[0] || null
        });
      } else {
        console.warn('Failed to fetch stats:', result);
        // Keep default stats instead of throwing error
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Keep default stats, don't show error to user
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getProgramBadgeColor = (programCode) => {
    if (!programCode) return 'bg-gray-100 text-gray-800';
    
    const colors = {
      'P1': 'bg-red-100 text-red-800',
      'P2': 'bg-green-100 text-green-800',
      'P3': 'bg-blue-100 text-blue-800',
      'P4': 'bg-orange-100 text-orange-800',
      'P5': 'bg-purple-100 text-purple-800',
      'P6': 'bg-indigo-100 text-indigo-800',
      'P7': 'bg-pink-100 text-pink-800',
      'P8': 'bg-yellow-100 text-yellow-800',
      'P9': 'bg-cyan-100 text-cyan-800',
      'P10': 'bg-gray-100 text-gray-800'
    };
    return colors[programCode] || 'bg-gray-100 text-gray-800';
  };

  const getBMIDisplay = (category) => {
    const mapping = {
      'B1': 'Underweight',
      'B2': 'Ideal',
      'B3': 'Overweight',
      'B4': 'Obese'
    };
    return mapping[category] || category || 'N/A';
  };

  const getBodyFatDisplay = (category) => {
    const mapping = {
      'L1': 'Rendah',
      'L2': 'Normal',
      'L3': 'Tinggi'
    };
    return mapping[category] || category || 'N/A';
  };

  const handleViewDetail = (consultation) => {
    if (!consultation || !consultation.id) {
      toast.error('Data konsultasi tidak valid');
      return;
    }

    // Create a detailed view modal or navigate to detail page
    const detailInfo = `
Detail Konsultasi:
- User: ${consultation.user?.name || 'N/A'} (${consultation.user?.email || 'N/A'})
- Program: ${consultation.program?.code || 'N/A'} - ${consultation.program?.name || 'N/A'}
- BMI: ${consultation.bmi || 'N/A'} (${getBMIDisplay(consultation.bmiCategory)})
- Body Fat: ${consultation.bodyFatPercentage || 'N/A'}% (${getBodyFatDisplay(consultation.bodyFatCategory)})
- Tanggal: ${formatDate(consultation.createdAt)}
- Status: ${consultation.status || 'N/A'}
    `.trim();

    alert(detailInfo);
    // TODO: Replace with proper modal or detail page navigation
  };

  // Filter consultations based on search term
  const filteredConsultations = consultations.filter(consultation => {
    if (!consultation) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      consultation.user?.name?.toLowerCase().includes(searchLower) ||
      consultation.user?.email?.toLowerCase().includes(searchLower) ||
      consultation.program?.code?.toLowerCase().includes(searchLower) ||
      consultation.program?.name?.toLowerCase().includes(searchLower) ||
      getBMIDisplay(consultation.bmiCategory)?.toLowerCase().includes(searchLower) ||
      getBodyFatDisplay(consultation.bodyFatCategory)?.toLowerCase().includes(searchLower)
    );
  });

  // Loading State
  if (loading) {
    return (
      <AdminSidebarLayout>
        <div className="max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Konsultasi</h1>
          
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data konsultasi dari database...</p>
          </div>
        </div>
      </AdminSidebarLayout>
    );
  }

  // Error State
  if (error && !loading && consultations.length === 0) {
    return (
      <AdminSidebarLayout>
        <div className="max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Konsultasi</h1>
          
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setError(null);
                  fetchConsultations();
                  fetchStats();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Coba Lagi
              </button>
            </div>
          </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Konsultasi</h1>
            <p className="text-gray-600 mt-1">Kelola semua riwayat konsultasi pengguna</p>
            
            {/* Data Source Indicator */}
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-sm text-green-800">
                ✅ <strong>Data Real-time:</strong> Menampilkan data dari backend API admin endpoint
                {error && (
                  <span className="block mt-1 text-orange-600">
                    ⚠️ Partial data - API issue: {error}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Cari:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama user, email, atau program..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-96"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              {stats.popularProgram ? stats.popularProgram.program?.code || 'N/A' : 'N/A'}
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-900">User Aktif</h3>
            <p className="text-2xl font-bold text-orange-800">{stats.activeUsers}</p>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="hidden md:block">
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
                {filteredConsultations.map((consultation, index) => (
                  <tr key={consultation.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(consultation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {consultation.user?.name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {consultation.user?.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProgramBadgeColor(consultation.program?.code)}`}>
                        {consultation.program?.code || 'N/A'}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {consultation.program?.name || 'Program tidak tersedia'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-sm">
                        BMI: {consultation.bmi || 'N/A'} ({getBMIDisplay(consultation.bmiCategory)})
                      </div>
                      <div className="text-sm text-gray-500">
                        Body Fat: {consultation.bodyFatPercentage || 'N/A'}% ({getBodyFatDisplay(consultation.bodyFatCategory)})
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
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredConsultations.map((consultation, index) => (
              <div key={consultation.id || index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {consultation.user?.name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {consultation.user?.email || 'No email'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(consultation.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetail(consultation)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Detail
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProgramBadgeColor(consultation.program?.code)}`}>
                    {consultation.program?.code || 'N/A'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {consultation.program?.name || 'Program tidak tersedia'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  BMI: {consultation.bmi || 'N/A'} ({getBMIDisplay(consultation.bmiCategory)}) | 
                  Body Fat: {consultation.bodyFatPercentage || 'N/A'}% ({getBodyFatDisplay(consultation.bodyFatCategory)})
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {filteredConsultations.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Tidak ada konsultasi yang ditemukan' : 'Belum ada riwayat konsultasi'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Coba ubah kata kunci pencarian Anda' 
                  : 'Konsultasi user akan muncul di sini setelah mereka menggunakan sistem'}
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

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Info (Dev Mode)</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Total Consultations: {consultations.length}</p>
              <p>Filtered: {filteredConsultations.length}</p>
              <p>Current Page: {pagination.page}</p>
              <p>Total Pages: {pagination.totalPages}</p>
              <p>Search Term: "{searchTerm}"</p>
              <p>API Error: {error || 'None'}</p>
              <p>Stats Loaded: {stats.total > 0 ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminConsultations;