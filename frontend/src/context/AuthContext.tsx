import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../config/api';

interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (userData: GoogleUser) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
  error: null,
  clearError: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const res = await api.get('/api/dashboard');
          setUser(res.data.user);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Set token in API client
  const setAuthToken = (token: string) => {
    if (token) {
      // Token is automatically set by the API client interceptor
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // Login with Google
  const loginWithGoogle = async (userData: GoogleUser) => {
    try {
      console.log('AuthContext: Processing Google login with user data:', userData);
      
      if (!userData || !userData.id) {
        throw new Error('Invalid user data provided');
      }
      
      // Send Google user data to backend
      const res = await api.post('/api/auth/google', { userData });
      console.log('AuthContext: Backend response:', res.data);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser({
        id: res.data.user.id || userData.id,
        name: res.data.user.name || userData.name,
        email: res.data.user.email || userData.email,
        photoURL: res.data.user.photoURL || userData.photoURL
      });
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      console.error('Google login error:', err);
      const errorMessage = err.response?.data?.message || 'Google login failed';
      setError(errorMessage);
      // Alert the user
      alert(`Login error: ${errorMessage}`);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 