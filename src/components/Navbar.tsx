import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Menu,
  Moon,
  Search,
  Server,
  Shield,
  Sun,
  User as UserIcon,
  UserX,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isMockModeEnabled } from '../services/api';
import { UserRole, ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenMobileSidebar: () => void;
  onOpenBackendModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenMobileSidebar,
  onOpenBackendModal,
  searchQuery,
  setSearchQuery,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, switchRole, toggleBanStatus, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const mockEnabled = isMockModeEnabled();

  const handleRoleToggle = (newRole: UserRole) => {
    switchRole(newRole);
    setProfileDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && currentView !== 'search') {
      onNavigate('search');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left controls: Mobile toggle & history */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => window.history.back()}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition hover:bg-zinc-800"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.history.forward()}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition hover:bg-zinc-800"
            title="Go forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64 md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value && currentView !== 'search') {
                onNavigate('search');
              }
            }}
            placeholder="Search tracks, artists, genres..."
            className="w-full bg-zinc-900/90 text-sm text-white placeholder-zinc-500 pl-9 pr-4 py-2 rounded-full border border-zinc-800 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition"
          />
        </form>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Spring Boot Backend Status Button */}
        <button
          onClick={onOpenBackendModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 transition shadow-sm"
          title="Click to configure Spring Boot URL and test connection"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                mockEnabled ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline font-mono text-[11px]">
              {mockEnabled ? 'Mock Mode' : 'Spring Boot Live'}
            </span>
          </div>
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Role Quick Switcher for Testing (Admin / User / Artist) */}
        <div className="hidden lg:flex items-center bg-zinc-900/90 border border-zinc-800 rounded-full p-0.5 text-xs">
          <button
            onClick={() => handleRoleToggle('USER')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              user?.role === 'USER'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            User
          </button>
          <button
            onClick={() => handleRoleToggle('ARTIST')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              user?.role === 'ARTIST'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Artist
          </button>
          <button
            onClick={() => handleRoleToggle('ADMIN')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              user?.role === 'ADMIN'
                ? 'bg-emerald-500 text-black font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/50 transition focus:outline-none"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
              alt={user?.fullName || 'Profile'}
              className="w-8 h-8 rounded-full object-cover border border-zinc-700"
            />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 text-zinc-200 text-sm z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2.5 border-b border-zinc-800">
                <p className="font-semibold text-white truncate">{user?.fullName || 'SoundWave User'}</p>
                <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {user?.plan || 'Premium HiFi'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Role: {user?.role}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-zinc-800 transition text-xs font-medium"
                >
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                  My Profile & Statistics
                </button>

                <button
                  onClick={() => {
                    onOpenBackendModal();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-zinc-800 transition text-xs font-medium"
                >
                  <Database className="w-4 h-4 text-indigo-400" />
                  Spring Boot Backend Config
                </button>

                <button
                  onClick={() => {
                    toggleBanStatus('Demonstration of Ban Page view');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 transition text-xs font-medium"
                  title="Test the Banned Account page restriction view"
                >
                  <UserX className="w-4 h-4 text-rose-400" />
                  {user?.isBanned ? 'Unban Account (Demo)' : 'Test Ban Restriction View'}
                </button>
              </div>

              <div className="pt-1 border-t border-zinc-800">
                <button
                  onClick={() => {
                    logout();
                    onNavigate('sign-in');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-zinc-400 hover:text-white hover:bg-zinc-800 transition text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
