import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SidebarLayout from '../components/common/SidebarLayout';
import { ClipboardDocumentListIcon, CalculatorIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();

  // Handle authentication and role-based redirects
  useEffect(() => {
    console.log('Home - Auth Check:', {
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

      // If user is admin, redirect to admin dashboard
      if (isAdmin) {
        console.log('Admin user detected, redirecting to admin dashboard');
        navigate('/admin');
        return;
      }
      
      // Regular user stays on home page
      console.log('Regular user authenticated, staying on home');
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const getGenderDisplay = (gender) => {
    return gender === 'male' ? 'Laki-laki' : 'Perempuan';
  };

  const getGenderIcon = (gender) => {
    return gender === 'male' ? '👨' : '👩';
  };

  const handleNavigation = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memverifikasi akses pengguna...</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // If not authenticated (shouldn't reach here due to redirect, but just in case)
  if (!isAuthenticated) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto">
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

  // If admin (shouldn't reach here due to redirect, but just in case)
  if (isAdmin) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Administrator Detected</h3>
            <p className="text-gray-600 mb-4">Mengarahkan ke admin dashboard...</p>
            <button
              onClick={() => navigate('/admin')}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
            >
              Ke Admin Dashboard
            </button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
          Selamat Datang di Sistem Pakar Program Olahraga
        </h1>
        
        {/* Auth Status Indicator */}
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✅ <strong>Status:</strong> Authenticated as User | Email: {user?.email} | Role: {user?.role}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Profil Anda</h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-16 lg:w-20">Nama:</span>
                <span className="text-sm text-gray-900">{user?.name || 'N/A'}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-16 lg:w-20">Email:</span>
                <span className="text-sm text-gray-900 truncate">{user?.email || 'N/A'}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-16 lg:w-20">Gender:</span>
                <span className="text-sm text-gray-900">
                  {user?.gender ? `${getGenderIcon(user.gender)} ${getGenderDisplay(user.gender)}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Mulai Konsultasi</h2>
            
            <p className="text-sm text-gray-600 mb-4">
              Dapatkan rekomendasi program olahraga yang sesuai dengan kondisi tubuh Anda.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleNavigation('/consultation')}
                className="inline-flex items-center w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 justify-center"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                Mulai Konsultasi
              </button>
              
              <button
                onClick={() => handleNavigation('/calculator')}
                className="inline-flex items-center w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200 justify-center"
              >
                <CalculatorIcon className="h-5 w-5 mr-2" />
                Kalkulator Kesehatan
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow p-4 lg:p-6 lg:col-span-2">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Cara Kerja Sistem</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Isi Data</h3>
                <p className="text-sm text-gray-600">
                  Masukkan data berat badan, tinggi badan, dan persentase lemak tubuh Anda
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Analisis</h3>
                <p className="text-sm text-gray-600">
                  Sistem akan menganalisis BMI dan kondisi tubuh Anda menggunakan metode forward chaining
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Rekomendasi</h3>
                <p className="text-sm text-gray-600">
                  Dapatkan program olahraga yang tepat sesuai dengan kondisi dan tujuan Anda
                </p>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 lg:p-6 lg:col-span-2">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Fitur Unggulan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                    <CalculatorIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Kalkulator Kesehatan</h3>
                    <p className="text-sm text-gray-600">Hitung kalori harian dan persentase lemak tubuh dengan akurat</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Konsultasi Cerdas</h3>
                    <p className="text-sm text-gray-600">Sistem pakar dengan forward chaining untuk rekomendasi tepat</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 rounded-lg p-2 flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">P1-P10</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">10 Program Tervalidasi</h3>
                    <p className="text-sm text-gray-600">Program olahraga yang sudah divalidasi oleh pakar kebugaran</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 rounded-lg p-2 flex-shrink-0">
                    <span className="text-orange-600 font-bold text-sm">24/7</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Akses Kapan Saja</h3>
                    <p className="text-sm text-gray-600">Konsultasi dan tracking progress kapan saja Anda butuhkan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 lg:mt-8 bg-white rounded-lg shadow p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Ringkasan Sistem</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-blue-600">10</div>
              <div className="text-xs lg:text-sm text-gray-600">Program Olahraga</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-green-600">2</div>
              <div className="text-xs lg:text-sm text-gray-600">Kalkulator Kesehatan</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-purple-600">7</div>
              <div className="text-xs lg:text-sm text-gray-600">Hari Program</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-orange-600">∞</div>
              <div className="text-xs lg:text-sm text-gray-600">Konsultasi</div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-6 lg:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Navigasi Cepat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => handleNavigation('/consultation')}
              className="text-sm text-blue-700 hover:text-blue-900 font-medium p-2 rounded hover:bg-blue-100 transition-colors duration-200"
            >
              → Konsultasi
            </button>
            <button
              onClick={() => handleNavigation('/calculator')}
              className="text-sm text-blue-700 hover:text-blue-900 font-medium p-2 rounded hover:bg-blue-100 transition-colors duration-200"
            >
              → Kalkulator
            </button>
            <button
              onClick={() => handleNavigation('/history')}
              className="text-sm text-blue-700 hover:text-blue-900 font-medium p-2 rounded hover:bg-blue-100 transition-colors duration-200"
            >
              → Riwayat
            </button>
            <button
              onClick={() => handleNavigation('/exercises')}
              className="text-sm text-blue-700 hover:text-blue-900 font-medium p-2 rounded hover:bg-blue-100 transition-colors duration-200"
            >
              → Gerakan
            </button>
          </div>
        </div>

        {/* Debug Info for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Info (Dev Mode)</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
              <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
              <p>User Email: {user?.email || 'None'}</p>
              <p>User Role: {user?.role || 'None'}</p>
              <p>User Gender: {user?.gender || 'None'}</p>
              <p>Current Route: /</p>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Home;