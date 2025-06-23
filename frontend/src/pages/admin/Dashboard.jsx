import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { UsersIcon, ClipboardDocumentListIcon, CogIcon, ChartBarIcon, PlayIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const menuItems = [
    {
      title: 'Program Olahraga',
      description: 'Kelola data program olahraga P1-P10',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      link: '/admin/programs',
      count: '10 Program'
    },
    {
      title: 'Aturan Sistem',
      description: 'Konfigurasi rules forward chaining',
      icon: CogIcon,
      color: 'bg-purple-500',
      link: '/admin/rules',
      count: '15 Rules'
    },
    {
      title: 'Riwayat Konsultasi',
      description: 'Monitor semua konsultasi pengguna',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      link: '/admin/consultations',
      count: '245 Konsultasi'
    },
    {
      title: 'Gerakan Latihan',
      description: 'Kelola video dan data gerakan',
      icon: PlayIcon,
      color: 'bg-green-500',
      link: '/admin/exercises',
      count: '50+ Gerakan'
    },
    {
      title: 'Kelola Pengguna',
      description: 'Manajemen akun dan hak akses',
      icon: UsersIcon,
      color: 'bg-red-500',
      link: '/admin/users',
      count: '128 Users'
    }
  ];

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
                <p className="text-2xl font-semibold text-gray-900">10</p>
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
                <p className="text-2xl font-semibold text-gray-900">128</p>
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
                <p className="text-2xl font-semibold text-gray-900">245</p>
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
                <p className="text-2xl font-semibold text-gray-900">50+</p>
              </div>
            </div>
          </div>
        </div>

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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">John Doe melakukan konsultasi</p>
                <p className="text-sm text-gray-500">Mendapat rekomendasi Program P2 - Muscle Gain</p>
              </div>
              <p className="text-sm text-gray-400">2 jam yang lalu</p>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">User baru terdaftar</p>
                <p className="text-sm text-gray-500">Jane Smith bergabung dengan sistem</p>
              </div>
              <p className="text-sm text-gray-400">5 jam yang lalu</p>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Program P5 diakses</p>
                <p className="text-sm text-gray-500">Alice Brown menggunakan Program Shred & Shape</p>
              </div>
              <p className="text-sm text-gray-400">1 hari yang lalu</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Data gerakan diperbarui</p>
                <p className="text-sm text-gray-500">Video tutorial Squat ditambahkan</p>
              </div>
              <p className="text-sm text-gray-400">2 hari yang lalu</p>
            </div>
          </div>
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
                <span className="text-sm text-blue-800">User Sessions</span>
                <span className="text-sm font-medium text-blue-600">24 Active</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Program Populer</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-800">P2 - Muscle Gain</span>
                <span className="text-sm font-medium text-green-600">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-800">P1 - Fat Loss</span>
                <span className="text-sm font-medium text-green-600">28%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-800">P3 - Maintenance</span>
                <span className="text-sm font-medium text-green-600">22%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminDashboard;