import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken } from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isArtist: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: { email: string; username: string; fullName: string; role?: UserRole }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  toggleBanStatus: (reason?: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());

  // Initialize session
  useEffect(() => {
    const init = async () => {
      try {
        const users = await api.admin.getUsers();
        // default to first active user or admin
        const savedUserId = localStorage.getItem('soundwave_active_user_id');
        const active = users.find((u) => u.id === savedUserId) || users[0];
        if (active) {
          setUser(active);
          localStorage.setItem('soundwave_active_user_id', active.id);
        }
      } catch (err) {
        console.error('Failed to init auth user', err);
      }
    };
    init();
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await api.auth.login(email, password);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('soundwave_active_user_id', res.user.id);
  };

  const register = async (data: { email: string; username: string; fullName: string; role?: UserRole }) => {
    const res = await api.auth.register(data);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('soundwave_active_user_id', res.user.id);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('soundwave_active_user_id');
  };

  const switchRole = async (role: UserRole) => {
    if (!user) return;
    const updated = await api.admin.updateUserRole(user.id, role);
    setUser({ ...updated });
  };

  const toggleBanStatus = async (reason?: string) => {
    if (!user) return;
    if (user.isBanned) {
      const updated = await api.admin.unbanUser(user.id);
      setUser({ ...updated });
    } else {
      const updated = await api.admin.banUser(
        user.id,
        reason || 'Violation of Community Terms & Music Streaming Policy'
      );
      setUser({ ...updated });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await api.auth.updateProfile(user.id, data);
    setUser({ ...updated });
  };

  const reloadUser = async () => {
    if (!user) return;
    const users = await api.admin.getUsers();
    const found = users.find((u) => u.id === user.id);
    if (found) setUser(found);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isArtist: user?.role === 'ARTIST' || user?.role === 'ADMIN',
        login,
        register,
        logout,
        switchRole,
        toggleBanStatus,
        updateProfile,
        reloadUser,
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
