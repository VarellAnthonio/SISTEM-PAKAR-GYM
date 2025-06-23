import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  PlayIcon,
  CalculatorIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    {
      name: 'Beranda',
      href: '/',
      icon: HomeIcon,
      current: location.pathname === '/'
    },
    {
      name: 'Konsultasi',
      href: '/consultation',
      icon: ClipboardDocumentListIcon,
      current: location.pathname === '/consultation'
    },
    {
      name: 'Kalkulator',
      href: '/calculator',
      icon: CalculatorIcon,
      current: location.pathname === '/calculator'
    },
    {
      name: 'Riwayat Konsultasi',
      href: '/history',
      icon: ClockIcon,
      current: location.pathname === '/history'
    },
    {
      name: 'Gerakan Latihan',
      href: '/exercises',
      icon: PlayIcon,
      current: location.pathname === '/exercises'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-200 shadow-sm flex flex-col transition-transform duration-300 ease-in-out lg:transition-none`}>
        
        {/* Header */}
        <div className="bg-gray-300 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Sistem Pakar Program Olahraga
            </h1>
          </div>
          {/* Mobile close button */}
          <button
            onClick={closeMobileMenu}
            className="lg:hidden p-1 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Label */}
        <div className="px-4 py-3">
          <h2 className="text-sm font-medium text-gray-700">Menu</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className={`${
                  item.current
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-700 hover:bg-gray-300'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-300 p-4">
          {/* Admin Quick Access */}
          {user?.role === 'admin' && (
            <div className="mb-3">
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
              >
                <CogIcon className="h-5 w-5 mr-3" />
                Admin Panel
              </Link>
            </div>
          )}
          
          <div className="flex items-center mb-3">
            <div className="bg-gray-400 p-2 rounded-full">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 rounded-md transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">
            Sistem Pakar Olahraga
          </h1>
          
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;