import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Consultation from './pages/Consultation';
import ConsultationResult from './pages/ConsultationResult';
import Calculator from './pages/Calculator';
import History from './pages/History';
import Exercises from './pages/Exercises';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminPrograms from './pages/admin/Programs';
import AdminRules from './pages/admin/Rules';
import AdminConsultations from './pages/admin/Consultations';
import AdminExercises from './pages/admin/Exercises';
import AdminUsers from './pages/admin/Users';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected User routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            
            <Route path="/consultation" element={
              <ProtectedRoute>
                <Consultation />
              </ProtectedRoute>
            } />
            
            <Route path="/consultation/result" element={
              <ProtectedRoute>
                <ConsultationResult />
              </ProtectedRoute>
            } />
            
            <Route path="/calculator" element={
              <ProtectedRoute>
                <Calculator />
              </ProtectedRoute>
            } />
            
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            
            <Route path="/exercises" element={
              <ProtectedRoute>
                <Exercises />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/programs" element={
              <ProtectedRoute adminOnly>
                <AdminPrograms />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/rules" element={
              <ProtectedRoute adminOnly>
                <AdminRules />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/consultations" element={
              <ProtectedRoute adminOnly>
                <AdminConsultations />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/exercises" element={
              <ProtectedRoute adminOnly>
                <AdminExercises />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;