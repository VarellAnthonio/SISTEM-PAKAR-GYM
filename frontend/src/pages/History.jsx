// frontend/src/pages/History.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/common/SidebarLayout';
import { useAuth } from '../contexts/AuthContext';
import { consultationService } from '../services/consultation';
import toast from 'react-hot-toast';
import { 
  ClockIcon, 
  EyeIcon, 
  TrashIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchConsultations();
  }, [pagination.page]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching consultations for user:', user?.name);
      
      const result = await consultationService.getUserConsultations({
        page: pagination.page,
        limit: pagination.limit
      });

      if (result.success) {
        const consultationsData = result.data?.consultations || [];
        
        // 🔍 DEBUG LOG
        console.log('📋 Received consultations:', consultationsData.map(c => ({
          id: c.id,
          consultationUserName: c.user?.name, // 🔧 Dari database
          contextUserName: user?.name,         // 🔧 Dari auth context
          programCode: c.program?.code
        })));
        
        setConsultations(consultationsData);
        
        if (result.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            total: result.data.pagination.total,
            totalPages: result.data.pagination.totalPages
          }));
        }
      } else {
        toast.error(result.message || 'Failed to load consultation history');
      }
    } catch (error) {
      console.error('❌ Error fetching consultations:', error);
      toast.error('Failed to load consultation history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    if (!category) return 'Tidak diukur';
    const mapping = {
      'L1': 'Rendah',
      'L2': 'Normal',
      'L3': 'Tinggi'
    };
    return mapping[category] || category;
  };

  const getConsultationType = (consultation) => {
    const isBMIOnly = !consultation.bodyFatPercentage;
    return {
      type: isBMIOnly ? 'BMI Only' : 'Complete',
      icon: isBMIOnly ? '📊' : '🔬',
      color: isBMIOnly ? 'text-blue-600' : 'text-green-600',
      bg: isBMIOnly ? 'bg-blue-50' : 'bg-green-50'
    };
  };

  const handleViewDetail = (consultation) => {
    // 🔧 PASTIKAN menggunakan nama user yang benar
    const displayUserName = consultation.user?.name || user?.name || 'Unknown User';
    
    console.log('🔍 Viewing consultation detail:', {
      consultationId: consultation.id,
      consultationUserName: consultation.user?.name,
      contextUserName: user?.name,
      displayUserName: displayUserName
    });

    const consultationResult = {
      user: displayUserName, // 🔧 Gunakan nama dari database consultation
      weight: consultation.weight,
      height: consultation.height,
      bodyFatPercentage: consultation.bodyFatPercentage,
      bmi: consultation.bmi,
      bmiCategory: consultation.bmiCategory,
      bodyFatCategory: consultation.bodyFatCategory,
      programCode: consultation.program?.code,
      programName: consultation.program?.name,
      timestamp: consultation.createdAt,
      consultationId: consultation.id,
      isBMIOnly: !consultation.bodyFatPercentage
    };
    
    navigate('/consultation/result', { 
      state: { result: consultationResult } 
    });
  };

  // 🗑️ FUNGSI HAPUS KONSULTASI
  const handleDelete = async (consultationId) => {
    if (!window.confirm('Yakin ingin menghapus konsultasi ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting consultation:', consultationId);
      
      const result = await consultationService.delete(consultationId);
      
      if (result.success) {
        toast.success('Konsultasi berhasil dihapus');
        
        // Refresh consultations list
        await fetchConsultations();
        
        // If no more consultations on current page, go to previous page
        const remainingCount = consultations.length - 1;
        if (remainingCount === 0 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        }
      } else {
        toast.error(result.message || 'Gagal menghapus konsultasi');
      }
    } catch (error) {
      console.error('❌ Error deleting consultation:', error);
      toast.error('Gagal menghapus konsultasi');
    }
  };

  if (loading && consultations.length === 0) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading consultation history...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Konsultasi</h1>
          <p className="text-gray-600">
            Lihat semua konsultasi yang pernah Anda lakukan
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Konsultasi</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">BMI Only</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations.filter(c => !c.bodyFatPercentage).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <ScaleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Complete</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations.filter(c => c.bodyFatPercentage).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Consultations List */}
        <div className="space-y-6">
          {consultations.map((consultation) => {
            const consultationType = getConsultationType(consultation);
            // 🔧 PASTIKAN display nama yang benar
            const displayUserName = consultation.user?.name || user?.name || 'Unknown User';
            
            return (
              <div key={consultation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {displayUserName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Konsultasi untuk: {displayUserName} {/* 🔧 Display nama yang benar */}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(consultation.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${consultationType.bg} ${consultationType.color}`}>
                      {consultationType.icon} {consultationType.type}
                    </span>
                  </div>
                </div>

                {/* Data */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">BMI</p>
                    <p className="font-medium">{consultation.bmi} ({getBMIDisplay(consultation.bmiCategory)})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Body Fat</p>
                    <p className="font-medium">
                      {consultation.bodyFatPercentage ? 
                        `${consultation.bodyFatPercentage}% (${getBodyFatDisplay(consultation.bodyFatCategory)})` : 
                        '❌ Tidak diukur'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Program</p>
                    <p className="font-medium">{consultation.program?.code} - {consultation.program?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-green-600">Selesai</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleViewDetail(consultation)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>Lihat Detail</span>
                  </button>
                  
                  {/* 🗑️ TOMBOL HAPUS */}
                  <button
                    onClick={() => handleDelete(consultation.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {consultations.length === 0 && !loading && (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada riwayat konsultasi</h3>
            <p className="text-gray-500 mb-6">Mulai konsultasi pertama Anda untuk mendapatkan rekomendasi program olahraga</p>
            <button
              onClick={() => navigate('/consultation')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Mulai Konsultasi
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default History;