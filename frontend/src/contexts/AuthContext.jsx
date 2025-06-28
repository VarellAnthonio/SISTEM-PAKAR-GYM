import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        // Check if user is logged in
        if (authService.isAuthenticated()) {
          console.log('Found existing auth, validating...');
          
          // Validate token with server
          const isValid = await authService.validateAuth();
          if (isValid) {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
            console.log('Authentication validated:', currentUser);
          } else {
            console.log('Authentication validation failed');
            setUser(null);
          }
        } else {
          console.log('No existing authentication found');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear potentially corrupted auth state
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', credentials.email);
      
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success('Login successful!');
        console.log('Login successful:', response.data.user);
        
        return { 
          success: true, 
          user: response.data.user 
        };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      const message = error.message || 'Login failed';
      toast.error(message);
      
      return { 
        success: false, 
        message 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Attempting registration with:', userData.email);
      
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success('Registration successful!');
        console.log('Registration successful:', response.data.user);
        
        return { 
          success: true, 
          user: response.data.user 
        };
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.message || 'Registration failed';
      toast.error(message);
      
      return { 
        success: false, 
        message,
        errors: error.errors || []
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      console.log('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      toast.error('Logout completed with errors');
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.getMe();
        if (response.success && response.data) {
          setUser(response.data);
          return response.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Refresh user error:', error);
      return null;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Get user display name
  const getUserDisplayName = () => {
    return user?.name || 'User';
  };

  // Check if user is verified/active
  const isUserActive = () => {
    return user?.isActive !== false;
  };

  const value = {
    // State
    user,
    loading,
    
    // Computed properties
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    
    // Methods
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    getUserDisplayName,
    isUserActive,
    
    // Utilities
    getToken: authService.getToken,
    getCurrentUser: authService.getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};