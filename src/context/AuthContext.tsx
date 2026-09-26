import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Pharmacy, UserRole } from '../types';
import { api, tokenStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  pharmacy: Pharmacy | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: { name: string; email: string; phone?: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [token, setToken] = useState<string | null>(tokenStorage.get());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const curToken = tokenStorage.get();
    if (!curToken) {
      setUser(null);
      setPharmacy(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.auth.me();
      setUser(data.user);
      setPharmacy(data.pharmacy || null);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      tokenStorage.remove();
      setToken(null);
      setUser(null);
      setPharmacy(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      tokenStorage.set(res.token);
      setToken(res.token);
      setUser(res.user);
      setPharmacy(res.pharmacy || null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (body: { name: string; email: string; phone?: string; password: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(body);
      tokenStorage.set(res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.role === 'PHARMACY') {
        const profile = await api.auth.me();
        setPharmacy(profile.pharmacy || null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.remove();
    setToken(null);
    setUser(null);
    setPharmacy(null);
  };

  const switchDemoRole = async (role: UserRole) => {
    if (role === 'ADMIN') {
      await login('admin@medifind.com', 'admin123');
    } else if (role === 'PHARMACY') {
      await login('apollo@medifind.com', 'pharmacy123');
    } else {
      await login('user@medifind.com', 'user123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pharmacy,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
