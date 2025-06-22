import Layout from '../../components/common/Layout';
import { UsersIcon, ClipboardDocumentListIcon, CogIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const menuItems = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: UsersIcon,
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Exercise Programs',
      description: 'Create and edit exercise programs',
      icon: ClipboardDocumentListIcon,
      color: 'bg-green-500',
      link: '/admin/programs'
    },
    {
      title: 'Rules Configuration',
      description: 'Configure forward chaining rules',
      icon: CogIcon,
      color: 'bg-purple-500',
      link: '/admin/rules'
    },
    {
      title: 'Consultations',
      description: 'View all user consultations',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      link: '/admin/consultations'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your fitness expert system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <a
              key={item.title}
              href={item.link}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`${item.color} p-3 rounded-lg`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;