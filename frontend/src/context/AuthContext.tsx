import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/api';
import type { User, AuthResponse, ApiResponse } from '../types';

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  city: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (data: SignupData) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bhejdo_token');
    if (token) {
      api
        .get<ApiResponse<{ user: User }>>('/auth/me')
        .then((response) => {
          setUser(response.data.data.user);
        })
        .catch(() => {
          localStorage.removeItem('bhejdo_token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    const { token, user: loggedInUser } = response.data.data;
    localStorage.setItem('bhejdo_token', token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (data: SignupData): Promise<User> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/signup', data);
    const { token, user: newUser } = response.data.data;
    localStorage.setItem('bhejdo_token', token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('bhejdo_token');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
