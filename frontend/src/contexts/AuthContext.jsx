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
  const [initialized, setInitialized] = useState(false);

  // Initialize authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('AuthContext: Initializing authentication...');
        setLoading(true);
        
        // Check if user is logged in
        if (authService.isAuthenticated()) {
          console.log('AuthContext: Found existing auth token, validating...');
          
          try {
            // Try to get current user info to validate token
            const response = await authService.getMe();
            
            if (response && response.success && response.data) {
              const userData = response.data;
              setUser(userData);
              console.log('AuthContext: Authentication validated successfully:', {
                email: userData.email,
                role: userData.role,
                name: userData.name
              });
            } else {
              console.log('AuthContext: Token validation failed, response:', response);
              // Invalid token, clear auth state
              await authService.logout();
              setUser(null);
            }
          } catch (error) {
            console.error('AuthContext: Token validation error:', error);
            
            // Check if it's a 401 error (token expired/invalid)
            if (error.response?.status === 401) {
              console.log('AuthContext: Token expired/invalid, clearing auth state');
              await authService.logout();
              setUser(null);
            } else {
              // Network or other error, keep existing state but log error
              console.error('AuthContext: Network error during validation:', error.message);
              const storedUser = authService.getCurrentUser();
              if (storedUser) {
                setUser(storedUser);
                console.log('AuthContext: Using stored user data due to network error');
              }
            }
          }
        } else {
          console.log('AuthContext: No existing authentication found');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
        // Clear potentially corrupted auth state
        await authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
        console.log('AuthContext: Authentication initialization complete');
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting login with:', credentials.email);
      
      const response = await authService.login(credentials);
      
      if (response && response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        toast.success('Login berhasil!');
        console.log('AuthContext: Login successful:', {
          email: userData.email,
          role: userData.role,
          name: userData.name
        });
        
        return { 
          success: true, 
          user: userData 
        };
      }
      
      throw new Error(response?.message || 'Login gagal');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      const message = error.message || 'Login gagal';
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
      console.log('AuthContext: Attempting registration with:', userData.email);
      
      const response = await authService.register(userData);
      
      if (response && response.success && response.data) {
        const newUser = response.data.user;
        setUser(newUser);
        toast.success('Registrasi berhasil!');
        console.log('AuthContext: Registration successful:', {
          email: newUser.email,
          role: newUser.role,
          name: newUser.name
        });
        
        return { 
          success: true, 
          user: newUser 
        };
      }
      
      throw new Error(response?.message || 'Registrasi gagal');
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      const message = error.message || 'Registrasi gagal';
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
      console.log('AuthContext: Logging out...');
      await authService.logout();
      setUser(null);
      toast.success('Logout berhasil');
      console.log('AuthContext: Logout completed');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      toast.success('Logout berhasil');
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.getMe();
        if (response && response.success && response.data) {
          setUser(response.data);
          return response.data;
        }
      }
      return null;
    } catch (error) {
      console.error('AuthContext: Refresh user error:', error);
      return null;
    }
  };

  // Validate token periodically (every 5 minutes)
  useEffect(() => {
    if (!initialized || !user) return;

    const validateTokenPeriodically = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getMe();
          if (!response || !response.success) {
            console.log('AuthContext: Periodic token validation failed, logging out');
            await logout();
          }
        }
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('AuthContext: Token expired during periodic check, logging out');
          await logout();
        }
      }
    };

    const interval = setInterval(validateTokenPeriodically, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [initialized, user]);

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
    initialized,
    
    // Computed properties
    isAuthenticated: !!user && authService.isAuthenticated(),
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