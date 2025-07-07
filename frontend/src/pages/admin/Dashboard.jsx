import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { 
  UsersIcon, 
  ClipboardDocumentListIcon, 
  CogIcon, 
  ChartBarIcon, 
  PlayIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { consultationService } from '../../services/consultation';
import { apiService } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    users: 0,
    programs: 10,
    exercises: 0,
    rules: 10,
    consultations: 0
  });
  const [consultationStats, setConsultationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentConsultations, setRecentConsultations] = useState([]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isAdmin, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch basic stats
      try {
        const healthResponse = await apiService.health();
        if (healthResponse.data?.stats) {
          setStats(healthResponse.data.stats);
        }
      } catch (error) {
        console.error('Health endpoint error:', error);
      }

      // Fetch consultation statistics
      try {
        const consultationStatsResult = await consultationService.admin.getStats();
        if (consultationStatsResult?.success) {
          setConsultationStats(consultationStatsResult.data);
        }
      } catch (error) {
        console.error('Consultation stats error:', error);
      }

      // Fetch recent consultations
      try {
        const recentConsultationsResult = await consultationService.admin.getAll({ limit: 3 });
        if (recentConsultationsResult?.success) {
          const consultationsData = recentConsultationsResult.data?.consultations || recentConsultationsResult.data || [];
          setRecentConsultations(Array.isArray(consultationsData) ? consultationsData : []);
        }
      } catch (error) {
        console.error('Recent consultations error:', error);
        setRecentConsultations([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Program Olahraga',
      description: 'Kelola 10 program olahraga',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/programs',
      count: stats.programs
    },
    {
      title: 'Gerakan Latihan',
      description: 'Kelola database gerakan',
      icon: PlayIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/exercises',
      count: stats.exercises
    },
    {
      title: 'Riwayat Konsultasi',
      description: 'Monitor konsultasi user',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/consultations',
      count: stats.consultations
    },
    {
      title: 'Aturan Sistem',
      description: 'Forward chaining rules',
      icon: CogIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin/rules',
      count: stats.rules
    }
  ];

  if (authLoading || loading) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-blue-100">
                Manage your fitness expert system from this dashboard
              </p>
            </div>
            <div className="text-right">
              <div className="text-blue-100 text-sm">System Status</div>
              <div className="flex items-center text-white">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.consultations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3 mr-4">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultationStats?.today || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultationStats?.activeUsers || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.link)}
                className={`${action.bgColor} rounded-xl p-6 text-left hover:shadow-md transition-all duration-200 border border-gray-100 group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${action.bgColor} rounded-lg p-3`}>
                    <action.icon className={`h-6 w-6 ${action.textColor}`} />
                  </div>
                  <span className={`text-2xl font-bold ${action.textColor}`}>
                    {action.count}
                  </span>
                </div>
                <h3 className={`font-semibold ${action.textColor} mb-1 group-hover:text-gray-900 transition-colors`}>
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Expert System Engine</span>
                <span className="flex items-center text-green-600">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Forward Chaining Rules</span>
                <span className="font-medium text-gray-900">{stats.rules} Rules</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Exercise Database</span>
                <span className="font-medium text-gray-900">{stats.exercises} Exercises</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Program Coverage</span>
                <span className="font-medium text-gray-900">100%</span>
              </div>
            </div>
          </div>

          {/* Recent Consultations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Consultations</h3>
            <div className="space-y-3">
              {recentConsultations.length > 0 ? (
                recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-start space-x-3 py-2">
                    <div className="bg-blue-100 rounded-full p-1.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{consultation.user?.name || 'Unknown User'}</span> consulted
                      </p>
                      <p className="text-xs text-gray-500">
                        Program: {consultation.program?.code || 'N/A'} - BMI: {consultation.bmi || 'N/A'}, Body Fat: {consultation.bodyFatPercentage || 'N/A'}%
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(consultation.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent consultations</p>
              )}
            </div>
            <button 
              onClick={() => navigate('/admin/consultations')}
              className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all consultations →
            </button>
          </div>
        </div>

        {/* Popular Program */}
        {consultationStats?.programStats?.[0] && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">Most Popular Program</h3>
                <p className="text-green-700">
                  <span className="font-bold text-2xl">
                    {consultationStats.programStats[0].program?.code}
                  </span>
                  {' - '}
                  {consultationStats.programStats[0].program?.name}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {consultationStats.programStats[0].count} consultations this month
                </p>
              </div>
              <div className="text-right">
                <button 
                  onClick={() => navigate('/admin/programs')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  View Programs
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminDashboard;