import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { UsersIcon, ClipboardDocumentListIcon, CogIcon, ChartBarIcon, PlayIcon } from '@heroicons/react/24/outline';
import { consultationService } from '../../services/consultation';
import { programService } from '../../services/program';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    programs: 0,
    exercises: 0,
    rules: 0,
    consultations: 0
  });
  const [consultationStats, setConsultationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentConsultations, setRecentConsultations] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch basic stats from health endpoint
        const healthResponse = await apiService.health();
        if (healthResponse.data.stats) {
          setStats(healthResponse.data.stats);
        }

        // Fetch consultation statistics
        const consultationStatsResult = await consultationService.admin.getStats();
        if (consultationStatsResult.success) {
          setConsultationStats(consultationStatsResult.data);
        }

        // Fetch recent consultations
        const recentConsultationsResult = await consultationService.admin.getAll({ limit: 5 });
        if (recentConsultationsResult.success) {
          setRecentConsultations(recentConsultationsResult.data.consultations || []);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const menuItems = [
    {
      title: 'Program Olahraga',
      description: 'Kelola data program olahraga P1-P10',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      link: '/admin/programs',
      count: `${stats.programs} Program`
    },
    {
      title: 'Aturan Sistem',
      description: 'Konfigurasi rules forward chaining',
      icon: CogIcon,
      color: 'bg-purple-500',
      link: '/admin/rules',
      count: `${stats.rules} Rules`
    },
    {
      title: 'Riwayat Konsultasi',
      description: 'Monitor semua konsultasi pengguna',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      link: '/admin/consultations',
      count: `${stats.consultations} Konsultasi`
    },
    {
      title: 'Gerakan Latihan',
      description: 'Kelola video dan data gerakan',
      icon: PlayIcon,
      color: 'bg-green-500',
      link: '/admin/exercises',
      count: `${stats.exercises} Gerakan`
    },
    {
      title: 'Kelola Pengguna',
      description: 'Manajemen akun dan hak akses',
      icon: UsersIcon,
      color: 'bg-red-500',
      link: '/admin/users',
      count: `${stats.users} Users`
    }
  ];

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
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Selamat datang di panel administrator sistem pakar program olahraga</p>
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
                <p className="text-2xl font-semibold text-gray-900">{stats.programs}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{stats.users}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{stats.consultations}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{stats.exercises}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats from Consultation API */}
        {consultationStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Konsultasi Hari Ini</h3>
              <p className="text-3xl font-bold text-blue-600">{consultationStats.today}</p>
              <p className="text-sm text-gray-500 mt-1">Dari total {consultationStats.total} konsultasi</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Aktif</h3>
              <p className="text-3xl font-bold text-green-600">{consultationStats.activeUsers}</p>
              <p className="text-sm text-gray-500 mt-1">30 hari terakhir</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Populer</h3>
              {consultationStats.programStats && consultationStats.programStats.length > 0 ? (
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {consultationStats.programStats[0].program.code}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {consultationStats.programStats[0].program.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {consultationStats.programStats[0].count} konsultasi
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
            <a
              key={item.title}
              href={item.link}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 block"
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
            </a>
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
                      {consultation.user?.name} melakukan konsultasi
                    </p>
                    <p className="text-sm text-gray-500">
                      Program: {consultation.program?.code} - BMI: {consultation.bmiDisplay}, Body Fat: {consultation.bodyFatDisplay}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">{formatDate(consultation.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Belum ada konsultasi terbaru</p>
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
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Program Distribution</h3>
            {consultationStats?.programStats && consultationStats.programStats.length > 0 ? (
              <div className="space-y-2">
                {consultationStats.programStats.slice(0, 3).map((stat) => (
                  <div key={stat.program.id} className="flex justify-between">
                    <span className="text-sm text-green-800">{stat.program.code} - {stat.program.name}</span>
                    <span className="text-sm font-medium text-green-600">{stat.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-800">Belum ada data distribusi program</p>
            )}
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminDashboard;