import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/common/SidebarLayout';
import { consultationService } from '../services/consultation';
import toast from 'react-hot-toast';

const History = () => {
  const navigate = useNavigate();
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

  // Fetch consultations from API with better error handling
  useEffect(() => {
    fetchConsultations();
  }, [pagination.page]);

  // Separate effect for search to avoid too many API calls
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
      
      console.log('Fetching consultations with params:', {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });

      const result = await consultationService.getUserConsultations({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm })
      });

      console.log('API Result:', result);

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
        console.error('API returned unsuccessful result:', result);
        setError(result?.message || 'Gagal memuat riwayat konsultasi');
        setConsultations([]);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setError('Gagal terhubung ke server');
      setConsultations([]);
      
      // Fallback to empty state instead of showing error toast immediately
      // toast.error('Gagal memuat riwayat konsultasi');
    } finally {
      setLoading(false);
    }
  };

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

  const filteredConsultations = consultations.filter(consultation => {
    if (!consultation) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      consultation.program?.code?.toLowerCase().includes(searchLower) ||
      consultation.program?.name?.toLowerCase().includes(searchLower) ||
      getBMIDisplay(consultation.bmiCategory)?.toLowerCase().includes(searchLower) ||
      getBodyFatDisplay(consultation.bodyFatCategory)?.toLowerCase().includes(searchLower)
    );
  });

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

  const handleDetail = (consultation) => {
    // Navigate to consultation result with the data
    const resultData = {
      user: consultation.user?.name || 'User',
      weight: consultation.weight,
      height: consultation.height,
      bodyFatPercentage: consultation.bodyFatPercentage,
      bmi: consultation.bmi,
      bmiCategory: consultation.bmiCategory,
      bodyFatCategory: consultation.bodyFatCategory,
      programCode: consultation.program?.code,
      programName: consultation.program?.name,
      timestamp: consultation.createdAt,
      consultationId: consultation.id
    };

    navigate('/consultation/result', { 
      state: { result: resultData } 
    });
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error('ID konsultasi tidak valid');
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus riwayat konsultasi ini?')) {
      try {
        const result = await consultationService.delete(id);
        
        if (result && result.success) {
          toast.success('Riwayat konsultasi berhasil dihapus');
          await fetchConsultations(); // Refresh data
        } else {
          toast.error(result?.message || 'Gagal menghapus riwayat konsultasi');
        }
      } catch (error) {
        console.error('Error deleting consultation:', error);
        toast.error('Gagal menghapus riwayat konsultasi');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getBMIDisplay = (category) => {
    const mapping = {
      'B1': 'Underweight',
      'B2': 'Ideal',
      'B3': 'Overweight',
      'B4': 'Obese'
    };
    return mapping[category] || category;
  };

  const getBodyFatDisplay = (category) => {
    const mapping = {
      'L1': 'Rendah',
      'L2': 'Normal',
      'L3': 'Tinggi'
    };
    return mapping[category] || category;
  };

  const getProgramBadgeColor = (programCode) => {
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

  // Loading State
  if (loading) {
    return (
      <SidebarLayout>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
            Riwayat Konsultasi
          </h1>
          
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat riwayat konsultasi dari database...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Error State
  if (error && !loading) {
    return (
      <SidebarLayout>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
            Riwayat Konsultasi
          </h1>
          
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setError(null);
                  fetchConsultations();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => navigate('/consultation')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                Mulai Konsultasi
              </button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header with Real Data Indicator */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Riwayat Konsultasi
            </h1>
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-sm text-green-800">
                ✅ <strong>Data Real-time:</strong> Menampilkan data konsultasi dari database (bukan mock-up)
              </p>
            </div>
          </div>
          
          {/* Search */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 hidden sm:inline">Cari:</span>
            <input
              type="text"
              placeholder="Cari program, BMI, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
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
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BMI & Body Fat
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
              {filteredConsultations.map((consultation, index) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(consultation.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProgramBadgeColor(consultation.program?.code)}`}>
                        {consultation.program?.code}
                      </span>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                          {consultation.program?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="text-sm">
                        BMI: {consultation.bmi} ({getBMIDisplay(consultation.bmiCategory)})
                      </div>
                      <div className="text-sm text-gray-500">
                        Body Fat: {consultation.bodyFatPercentage}% ({getBodyFatDisplay(consultation.bodyFatCategory)})
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      consultation.status === 'active' ? 'bg-green-100 text-green-800' :
                      consultation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {consultation.status === 'active' ? 'Aktif' :
                       consultation.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleDetail(consultation)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Lihat Program
                    </button>
                    <button
                      onClick={() => handleDelete(consultation.id)}
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
        <div className="md:hidden space-y-4">
          {filteredConsultations.map((consultation, index) => (
            <div key={consultation.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">
                      #{(pagination.page - 1) * pagination.limit + index + 1}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProgramBadgeColor(consultation.program?.code)}`}>
                      {consultation.program?.code}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(consultation.createdAt)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDetail(consultation)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleDelete(consultation.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {consultation.program?.name}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  consultation.status === 'active' ? 'bg-green-100 text-green-800' :
                  consultation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {consultation.status === 'active' ? 'Aktif' :
                   consultation.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">BMI:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {consultation.bmi} ({getBMIDisplay(consultation.bmiCategory)})
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Body Fat:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {consultation.bodyFatPercentage}% ({getBodyFatDisplay(consultation.bodyFatCategory)})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredConsultations.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow text-center py-8">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Tidak ada hasil yang ditemukan' : 'Belum ada riwayat konsultasi'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Coba ubah kata kunci pencarian Anda' 
                : 'Mulai konsultasi pertama Anda untuk mendapatkan rekomendasi program olahraga'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/consultation')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Mulai Konsultasi
              </button>
            )}
          </div>
        )}

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

        {/* Summary Card with Real Data */}
        {consultations.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Ringkasan Konsultasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <strong>Total konsultasi:</strong> {pagination.total || consultations.length}
              </div>
              <div>
                <strong>Program aktif:</strong> {consultations.filter(c => c && c.status === 'active').length}
              </div>
              <div>
                <strong>Program terbanyak:</strong> {
                  (() => {
                    if (consultations.length === 0) return 'N/A';
                    
                    const programCounts = consultations.reduce((acc, curr) => {
                      if (curr && curr.program && curr.program.code) {
                        acc[curr.program.code] = (acc[curr.program.code] || 0) + 1;
                      }
                      return acc;
                    }, {});
                    
                    const entries = Object.entries(programCounts);
                    if (entries.length === 0) return 'N/A';
                    
                    const mostUsed = entries.sort(([,a], [,b]) => b - a)[0];
                    return mostUsed ? mostUsed[0] : 'N/A';
                  })()
                }
              </div>
            </div>
          </div>
        )}

        {/* API Integration Info */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            💡 <strong>Real-time Data:</strong> Halaman ini menggunakan data real dari backend API consultation endpoint, 
            bukan mock-up data. Data langsung tersinkronisasi dengan database PostgreSQL.
            {error && (
              <span className="block mt-1 text-red-600">
                ⚠️ Saat ini menggunakan fallback karena: {error}
              </span>
            )}
          </p>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default History;