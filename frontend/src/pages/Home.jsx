import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SidebarLayout from '../components/common/SidebarLayout';
import { 
  ClipboardDocumentListIcon, 
  CalculatorIcon, 
  ExclamationTriangleIcon,
  PlayIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();

  // Handle authentication and role-based redirects
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      // If user is admin, redirect to admin dashboard
      if (isAdmin) {
        navigate('/admin');
        return;
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const getGenderDisplay = (gender) => {
    return gender === 'male' ? 'Laki-laki' : 'Perempuan';
  };

  const getGenderIcon = (gender) => {
    return gender === 'male' ? '👨' : '👩';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    if (hour < 21) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat dashboard...</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // If not authenticated
  if (!isAuthenticated) {
    return (
      <SidebarLayout>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Akses Ditolak</h3>
            <p className="text-gray-600 mb-4">Anda harus login terlebih dahulu</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // If admin (redirect in progress)
  if (isAdmin) {
    return (
      <SidebarLayout>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <SparklesIcon className="mx-auto h-12 w-12 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mengarahkan ke Admin Dashboard</h3>
            <div className="animate-pulse">
              <div className="h-2 bg-purple-200 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Siap untuk program olahraga yang tepat untuk Anda?
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <ClipboardDocumentListIcon className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Consultation Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Konsultasi Program</h3>
                <p className="text-sm text-gray-600">Dapatkan program yang sesuai</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Sistem pakar kami akan menganalisis kondisi tubuh Anda dan memberikan rekomendasi program olahraga terbaik.
            </p>
            <button
              onClick={() => handleNavigation('/consultation')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Mulai Konsultasi
            </button>
          </div>

          {/* Health Calculator Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <CalculatorIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Kalkulator Kesehatan</h3>
                <p className="text-sm text-gray-600">Hitung BMI dan kalori</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Hitung kebutuhan kalori harian dan persentase lemak tubuh Anda dengan akurat.
            </p>
            <button
              onClick={() => handleNavigation('/calculator')}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Buka Kalkulator
            </button>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 rounded-lg p-3 mr-3">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Profil Anda</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Nama:</span>
                <span className="text-sm text-gray-900 font-medium">{user?.name || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Gender:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {user?.gender ? `${getGenderIcon(user.gender)} ${getGenderDisplay(user.gender)}` : 'N/A'}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleNavigation('/history')}
                  className="w-full text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center justify-center"
                >
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Lihat Riwayat Konsultasi
                </button>
              </div>
            </div>
          </div>

          {/* Exercise Library Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 rounded-lg p-3 mr-3">
                <PlayIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Gerakan Latihan</h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Jelajahi koleksi lengkap gerakan latihan dengan video tutorial.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">24+</div>
                <div className="text-xs text-gray-500">Exercise</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">5</div>
                <div className="text-xs text-gray-500">Kategori</div>
              </div>
            </div>

            <button
              onClick={() => handleNavigation('/exercises')}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm font-medium"
            >
              Jelajahi Exercise
            </button>
          </div>

          {/* System Features Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 rounded-lg p-3 mr-3">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fitur Sistem</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-700">Forward Chaining Algorithm</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-700">10 Program Tervalidasi</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-700">Video Tutorial YouTube</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-700">Export PDF Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Bagaimana Sistem Bekerja?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Input Data</h3>
              <p className="text-sm text-gray-600">
                Masukkan berat badan, tinggi badan, dan persentase lemak tubuh
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Analisis AI</h3>
              <p className="text-sm text-gray-600">
                Forward chaining algorithm menganalisis kondisi tubuh Anda
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Rekomendasi</h3>
              <p className="text-sm text-gray-600">
                Dapatkan program olahraga yang tepat sesuai kondisi Anda
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Sistem Pakar Program Olahraga
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">10</div>
              <div className="text-sm text-gray-600">Program</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24+</div>
              <div className="text-sm text-gray-600">Exercise</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">7</div>
              <div className="text-sm text-gray-600">Hari Program</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">∞</div>
              <div className="text-sm text-gray-600">Konsultasi</div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Home;