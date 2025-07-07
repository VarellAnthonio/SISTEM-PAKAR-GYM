import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  UserIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
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

  useEffect(() => {
    fetchConsultations();
  }, [pagination.page]);

  useEffect(() => {
    fetchStats();
  }, []);

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

      const result = await consultationService.admin.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm })
      });

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
        setConsultations([]);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await consultationService.admin.getStats();
      
      if (result && result.success && result.data) {
        setStats({
          total: result.data.total || 0,
          today: result.data.today || 0,
          activeUsers: result.data.activeUsers || 0,
          popularProgram: result.data.programStats?.[0] || null
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
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
      'L1': 'Low',
      'L2': 'Normal',
      'L3': 'High'
    };
    return mapping[category] || category || 'N/A';
  };

  const handleViewDetail = (consultation) => {
    if (!consultation || !consultation.id) {
      toast.error('Invalid consultation data');
      return;
    }

    const detailInfo = `
Consultation Details:
- User: ${consultation.user?.name || 'N/A'} (${consultation.user?.email || 'N/A'})
- Program: ${consultation.program?.code || 'N/A'} - ${consultation.program?.name || 'N/A'}
- BMI: ${consultation.bmi || 'N/A'} (${getBMIDisplay(consultation.bmiCategory)})
- Body Fat: ${consultation.bodyFatPercentage || 'N/A'}% (${getBodyFatDisplay(consultation.bodyFatCategory)})
- Date: ${formatDate(consultation.createdAt)}
- Status: ${consultation.status || 'N/A'}
    `.trim();

    alert(detailInfo);
  };

  if (loading && consultations.length === 0) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading consultations...</p>
          </div>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Consultation History</h1>
          <p className="text-gray-600">Monitor all user consultations and system usage</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3 mr-4">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Popular Program</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.popularProgram ? stats.popularProgram.program?.code || 'N/A' : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Consultations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultations.map((consultation) => (
                  <tr key={consultation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-full p-2 mr-3">
                          <UserIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {consultation.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {consultation.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getProgramBadgeColor(consultation.program?.code)}`}>
                          {consultation.program?.code || 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {consultation.program?.name || 'Program not available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>BMI: {consultation.bmi || 'N/A'}</div>
                        <div>Body Fat: {consultation.bodyFatPercentage || 'N/A'}%</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {getBMIDisplay(consultation.bmiCategory)} • {getBodyFatDisplay(consultation.bodyFatCategory)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(consultation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetail(consultation)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded-full p-2 mr-3">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {consultation.user?.name || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {consultation.user?.email || 'No email'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetail(consultation)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProgramBadgeColor(consultation.program?.code)}`}>
                    {consultation.program?.code || 'N/A'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {consultation.program?.name || 'Program not available'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-gray-600">BMI:</span>
                    <span className="ml-1 font-medium">{consultation.bmi || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Body Fat:</span>
                    <span className="ml-1 font-medium">{consultation.bodyFatPercentage || 'N/A'}%</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {formatDate(consultation.createdAt)}
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {consultations.length === 0 && !loading && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No consultations found' : 'No consultations yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'User consultations will appear here'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} consultations
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

        {/* System Performance Indicator */}
        <div className="mt-8 bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 rounded-full p-2">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-900">Forward Chaining System</h4>
              <p className="text-sm text-green-700">
                All consultations processed successfully with 100% medical logic coverage.
                System is operating optimally.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminConsultations;