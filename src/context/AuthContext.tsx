import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken } from '../services/api';
import { ActivePortal, User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  activePortal: ActivePortal;
  setActivePortal: (portal: ActivePortal) => void;
  login: (email: string, password?: string, targetPortal?: 'user' | 'admin') => Promise<void>;
  register: (data: { email: string; username: string; fullName: string; role?: UserRole }) => Promise<void>;
  logout: () => void;
  toggleBanStatus: (reason?: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  switchToAdminPortal: () => boolean;
  switchToUserPortal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [activePortal, setActivePortal] = useState<ActivePortal>('user');

  // Load session from storage
  useEffect(() => {
    const init = async () => {
      try {
        const users = await api.admin.getUsers();
        const savedUserId = localStorage.getItem('harmoniq_active_user_id');
        const active = users.find((u) => u.id === savedUserId) || users[0];

        if (active) {
          setUser(active);
          localStorage.setItem('harmoniq_active_user_id', active.id);

          if (active.isBanned) {
            setActivePortal('banned');
          } else {
            const savedPortal = localStorage.getItem('harmoniq_active_portal') as ActivePortal;
            if (savedPortal === 'admin' && active.role === 'ADMIN') {
              setActivePortal('admin');
            } else {
              setActivePortal('user');
            }
          }
        }
      } catch (err) {
        console.error('Failed to init auth session', err);
      }
    };
    init();
  }, []);

  const handleSetPortal = (portal: ActivePortal) => {
    setActivePortal(portal);
    localStorage.setItem('harmoniq_active_portal', portal);
  };

  const login = async (
    email: string,
    password?: string,
    targetPortal: 'user' | 'admin' = 'user'
  ) => {
    const res = await api.auth.login(email, password);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('harmoniq_active_user_id', res.user.id);

    if (res.user.isBanned) {
      handleSetPortal('banned');
      return;
    }

    if (targetPortal === 'admin') {
      if (res.user.role === 'ADMIN') {
        handleSetPortal('admin');
      } else {
        // Not an admin
        handleSetPortal('user');
      }
    } else {
      handleSetPortal('user');
    }
  };

  const register = async (data: {
    email: string;
    username: string;
    fullName: string;
    role?: UserRole;
  }) => {
    const res = await api.auth.register(data);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('harmoniq_active_user_id', res.user.id);
    handleSetPortal('user');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('harmoniq_active_user_id');
    localStorage.removeItem('harmoniq_active_portal');
    handleSetPortal('auth');
  };

  const switchToAdminPortal = (): boolean => {
    if (user?.role === 'ADMIN') {
      handleSetPortal('admin');
      return true;
    }
    return false;
  };

  const switchToUserPortal = () => {
    handleSetPortal('user');
  };

  const toggleBanStatus = async (reason?: string) => {
    if (!user) return;
    if (user.isBanned) {
      const updated = await api.admin.unbanUser(user.id);
      setUser({ ...updated });
      handleSetPortal(updated.role === 'ADMIN' ? 'admin' : 'user');
    } else {
      const updated = await api.admin.banUser(
        user.id,
        reason || 'Policy infraction reported by HarmoniQ Security Center'
      );
      setUser({ ...updated });
      handleSetPortal('banned');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await api.auth.updateProfile(user.id, data);
    setUser({ ...updated });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isBanned: !!user?.isBanned,
        activePortal,
        setActivePortal: handleSetPortal,
        login,
        register,
        logout,
        toggleBanStatus,
        updateProfile,
        switchToAdminPortal,
        switchToUserPortal,
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
