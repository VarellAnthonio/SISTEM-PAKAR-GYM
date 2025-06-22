import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/common/Layout';

const Home = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Sistem Pakar Program Olahraga
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Selamat datang, <span className="font-semibold">{user.name}</span>!
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Your Role:</strong> {user.role === 'admin' ? 'Administrator' : 'User'}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Email:</strong> {user.email}
            </p>
          </div>

          {user.role === 'admin' ? (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h2 className="font-semibold text-yellow-900 mb-2">Admin Features</h2>
              <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                <li>Manage exercise programs</li>
                <li>Configure forward chaining rules</li>
                <li>View all user consultations</li>
                <li>Manage user accounts</li>
              </ul>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="font-semibold text-green-900 mb-2">User Features</h2>
              <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                <li>Get personalized exercise recommendations</li>
                <li>View exercise history</li>
                <li>Track your fitness progress</li>
                <li>Access exercise tutorials</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;