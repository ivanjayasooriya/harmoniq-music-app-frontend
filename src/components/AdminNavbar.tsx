import React from 'react';
import {
  ExternalLink,
  LogOut,
  Menu,
  Moon,
  Server,
  Shield,
  Sun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isMockModeEnabled } from '../services/api';
import { AdminView } from '../types';

interface AdminNavbarProps {
  currentView: AdminView;
  onOpenMobileSidebar: () => void;
  onOpenBackendModal: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  currentView,
  onOpenMobileSidebar,
  onOpenBackendModal,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, switchToUserPortal } = useAuth();
  const mockEnabled = isMockModeEnabled();

  const titleMap: Record<AdminView, string> = {
    dashboard: 'Operations & Analytics Dashboard',
    music: 'Music Catalog Management',
    artists: 'Artist Roster Management',
    users: 'User Account Management',
    banned: 'Suspended Accounts & Appeals',
    genres: 'Genre & Taxonomy Management',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-zinc-950/90 backdrop-blur-md border-b border-indigo-950/70 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">{titleMap[currentView]}</h2>
            <p className="text-[10px] text-zinc-400">HarmoniQ Backstage Administration</p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenBackendModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-indigo-800/60 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 transition shadow-sm"
          title="Configure Spring Boot API"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              mockEnabled ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline font-mono text-[11px]">
            {mockEnabled ? 'Mock Mode' : 'Live: 8080'}
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        <button
          onClick={switchToUserPortal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
          title="Switch to Listener portal"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Listener View</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
            alt={user?.fullName || 'Admin'}
            className="w-8 h-8 rounded-full object-cover border border-indigo-500/50"
          />
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 transition"
            title="Log out of Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
