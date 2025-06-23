import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SidebarLayout from '../components/common/SidebarLayout';
import { ClipboardDocumentListIcon, CalculatorIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const getGenderDisplay = (gender) => {
    return gender === 'male' ? 'Laki-laki' : 'Perempuan';
  };

  const getGenderIcon = (gender) => {
    return gender === 'male' ? '👨' : '👩';
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
          Selamat Datang di Sistem Pakar Program Olahraga
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Profil Anda</h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-16 lg:w-20">Nama:</span>
                <span className="text-sm text-gray-900">{user.name}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-16 lg:w-20">Email:</span>
                <span className="text-sm text-gray-900 truncate">{user.email}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-16 lg:w-20">Gender:</span>
                <span className="text-sm text-gray-900">
                  {getGenderIcon(user.gender)} {getGenderDisplay(user.gender)}
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
              <a
                href="/consultation"
                className="inline-flex items-center w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 justify-center"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                Mulai Konsultasi
              </a>
              
              <a
                href="/calculator"
                className="inline-flex items-center w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200 justify-center"
              >
                <CalculatorIcon className="h-5 w-5 mr-2" />
                Kalkulator Kesehatan
              </a>
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
      </div>
    </SidebarLayout>
  );
};

export default Home;