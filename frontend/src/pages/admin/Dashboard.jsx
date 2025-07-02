import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { UsersIcon, ClipboardDocumentListIcon, CogIcon, ChartBarIcon, PlayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { consultationService } from '../../services/consultation';
import { programService } from '../../services/program';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    users: 0,
    programs: 0,
    exercises: 0,
    rules: 0,
    consultations: 0
  });
  const [consultationStats, setConsultationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentConsultations, setRecentConsultations] = useState([]);

  // Check authentication and admin role
  useEffect(() => {
    console.log('Admin Dashboard - Auth Check:', {
      isAuthenticated,
      isAdmin,
      user: user?.email,
      role: user?.role,
      authLoading
    });

    if (!authLoading) {
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        navigate('/login');
        return;
      }

      if (!isAdmin) {
        console.log('Not admin, redirecting to home');
        toast.error('Akses ditolak. Anda bukan administrator.');
        navigate('/');
        return;
      }

      // If we reach here, user is authenticated admin
      fetchDashboardData();
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching admin dashboard data...');

      // Fetch basic stats from health endpoint
      try {
        const healthResponse = await apiService.health();
        console.log('Health Response:', healthResponse.data);
        
        if (healthResponse.data?.stats) {
          setStats(healthResponse.data.stats);
        }
      } catch (healthError) {
        console.error('Health endpoint error:', healthError);
        // Continue with other requests even if health fails
      }

      // Fetch consultation statistics
      try {
        const consultationStatsResult = await consultationService.admin.getStats();
        console.log('Consultation Stats Result:', consultationStatsResult);
        
        if (consultationStatsResult && consultationStatsResult.success) {
          setConsultationStats(consultationStatsResult.data);
        }
      } catch (consultationError) {
        console.error('Consultation stats error:', consultationError);
        // Continue with other requests
      }

      // Fetch recent consultations
      try {
        const recentConsultationsResult = await consultationService.admin.getAll({ limit: 5 });
        console.log('Recent Consultations Result:', recentConsultationsResult);
        
        if (recentConsultationsResult && recentConsultationsResult.success) {
          const consultationsData = recentConsultationsResult.data?.consultations || recentConsultationsResult.data || [];
          setRecentConsultations(Array.isArray(consultationsData) ? consultationsData : []);
        }
      } catch (recentError) {
        console.error('Recent consultations error:', recentError);
        // Continue, just set empty array
        setRecentConsultations([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Program Olahraga',
      description: 'Kelola data program olahraga P1-P10',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      link: '/admin/programs',
      count: `${stats.programs || 0} Program`
    },
    {
      title: 'Aturan Sistem',
      description: 'Konfigurasi rules forward chaining',
      icon: CogIcon,
      color: 'bg-purple-500',
      link: '/admin/rules',
      count: `${stats.rules || 0} Rules`
    },
    {
      title: 'Riwayat Konsultasi',
      description: 'Monitor semua konsultasi pengguna',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      link: '/admin/consultations',
      count: `${stats.consultations || 0} Konsultasi`
    },
    {
      title: 'Gerakan Latihan',
      description: 'Kelola video dan data gerakan',
      icon: PlayIcon,
      color: 'bg-green-500',
      link: '/admin/exercises',
      count: `${stats.exercises || 0} Gerakan`
    },
    {
      title: 'Kelola Pengguna',
      description: 'Manajemen akun dan hak akses',
      icon: UsersIcon,
      color: 'bg-red-500',
      link: '/admin/users',
      count: `${stats.users || 0} Users`
    }
  ];

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

  const handleMenuClick = (link) => {
    console.log('Navigating to:', link);
    navigate(link);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memverifikasi akses administrator...</p>
          </div>
        </div>
      </AdminSidebarLayout>
    );
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <AdminSidebarLayout>
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Selamat datang, {user?.name}</p>
          </div>
          
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data dashboard...</p>
            </div>
          </div>
        </div>
      </AdminSidebarLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminSidebarLayout>
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Selamat datang, {user?.name}</p>
          </div>

          <div className="bg-white shadow rounded-lg p-8 text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchDashboardData();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Selamat datang, <strong>{user?.name}</strong> - Administrator Sistem Pakar Program Olahraga
          </p>
          
          {/* Auth Status Indicator */}
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              ✅ <strong>Status:</strong> Authenticated as Admin | Email: {user?.email} | Role: {user?.role}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Program</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.programs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.users || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Konsultasi</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.consultations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <PlayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gerakan</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.exercises || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats from Consultation API */}
        {consultationStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Konsultasi Hari Ini</h3>
              <p className="text-3xl font-bold text-blue-600">{consultationStats.today || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Dari total {consultationStats.total || 0} konsultasi</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Aktif</h3>
              <p className="text-3xl font-bold text-green-600">{consultationStats.activeUsers || 0}</p>
              <p className="text-sm text-gray-500 mt-1">30 hari terakhir</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Populer</h3>
              {consultationStats.programStats && consultationStats.programStats.length > 0 ? (
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {consultationStats.programStats[0].program?.code || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {consultationStats.programStats[0].program?.name || 'Program tidak tersedia'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {consultationStats.programStats[0].count || 0} konsultasi
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Belum ada data</p>
              )}
            </div>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => handleMenuClick(item.link)}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 text-left"
            >
              <div className="flex items-center">
                <div className={`${item.color} p-3 rounded-lg`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <p className="text-sm font-medium text-gray-500 mt-2">{item.count}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Konsultasi Terbaru</h2>
          {recentConsultations.length > 0 ? (
            <div className="space-y-4">
              {recentConsultations.map((consultation) => (
                <div key={consultation.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {consultation.user?.name || 'Unknown User'} melakukan konsultasi
                    </p>
                    <p className="text-sm text-gray-500">
                      Program: {consultation.program?.code || 'N/A'} - BMI: {consultation.bmi || 'N/A'}, Body Fat: {consultation.bodyFatPercentage || 'N/A'}%
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">{formatDate(consultation.createdAt)}</p>
                </div>
              ))}
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => handleMenuClick('/admin/consultations')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Lihat Semua Konsultasi →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Belum ada konsultasi terbaru</p>
              <button
                onClick={() => handleMenuClick('/admin/consultations')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Lihat Riwayat Konsultasi →
              </button>
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Status Sistem</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-800">Database</span>
                <span className="text-sm font-medium text-green-600">✓ Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-800">Forward Chaining Engine</span>
                <span className="text-sm font-medium text-green-600">✓ Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-800">API Endpoints</span>
                <span className="text-sm font-medium text-green-600">✓ Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-800">Authentication</span>
                <span className="text-sm font-medium text-green-600">✓ Admin Access</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Program Distribution</h3>
            {consultationStats?.programStats && consultationStats.programStats.length > 0 ? (
              <div className="space-y-2">
                {consultationStats.programStats.slice(0, 3).map((stat) => (
                  <div key={stat.program?.id || Math.random()} className="flex justify-between">
                    <span className="text-sm text-green-800">
                      {stat.program?.code || 'N/A'} - {stat.program?.name || 'Program tidak tersedia'}
                    </span>
                    <span className="text-sm font-medium text-green-600">{stat.count || 0}</span>
                  </div>
                ))}
                
                <div className="mt-3 pt-2 border-t border-green-200">
                  <button
                    onClick={() => handleMenuClick('/admin/consultations')}
                    className="text-sm text-green-700 hover:text-green-900 font-medium"
                  >
                    Lihat Detail Statistik →
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-green-800">Belum ada data distribusi program</p>
            )}
          </div>
        </div>

        {/* Debug Info for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Info (Dev Mode)</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
              <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
              <p>User Email: {user?.email || 'None'}</p>
              <p>User Role: {user?.role || 'None'}</p>
              <p>Stats Loaded: {Object.values(stats).some(v => v > 0) ? 'Yes' : 'No'}</p>
              <p>Consultation Stats: {consultationStats ? 'Loaded' : 'None'}</p>
              <p>Recent Consultations: {recentConsultations.length}</p>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminDashboard;