import React from 'react';
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Music,
  Server,
  Sliders,
  Tag,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isMockModeEnabled } from '../services/api';
import { AdminView } from '../types';
import { HarmoniQLogo } from './HarmoniQLogo';

interface AdminSidebarProps {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenBackendModal: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  onOpenBackendModal,
}) => {
  const { user, logout, switchToUserPortal } = useAuth();
  const mockEnabled = isMockModeEnabled();

  const handleNav = (view: AdminView) => {
    onNavigate(view);
    onCloseMobile();
  };

  const navClass = (active: boolean) =>
    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 font-semibold shadow-sm border border-indigo-500/30'
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
    }`;

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-zinc-950/95 lg:bg-zinc-950 border-r border-indigo-950/60 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-950/50">
          <div
            onClick={() => handleNav('dashboard')}
            className="cursor-pointer group inline-block"
          >
            <HarmoniQLogo size="md" variant="admin" />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Management Modules
            </p>

            <nav className="space-y-1">
              <button
                onClick={() => handleNav('dashboard')}
                className={`w-full ${navClass(currentView === 'dashboard')}`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>Overview Dashboard</span>
              </button>

              <button
                onClick={() => handleNav('music')}
                className={`w-full ${navClass(currentView === 'music')}`}
              >
                <Music className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Music Catalog</span>
              </button>

              <button
                onClick={() => handleNav('artists')}
                className={`w-full ${navClass(currentView === 'artists')}`}
              >
                <UserCheck className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Artist Roster</span>
              </button>

              <button
                onClick={() => handleNav('users')}
                className={`w-full ${navClass(currentView === 'users')}`}
              >
                <Users className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>User Accounts</span>
              </button>

              <button
                onClick={() => handleNav('banned')}
                className={`w-full ${navClass(currentView === 'banned')}`}
              >
                <UserX className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Banned Accounts</span>
              </button>

              <button
                onClick={() => handleNav('genres')}
                className={`w-full ${navClass(currentView === 'genres')}`}
              >
                <Tag className="w-4 h-4 shrink-0 text-purple-400" />
                <span>Genre Taxonomies</span>
              </button>
            </nav>
          </div>

          {/* Spring Boot status pill */}
          <div className="px-2">
            <button
              onClick={onOpenBackendModal}
              className="w-full p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-left transition space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Spring Boot</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    mockEnabled ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
              </div>
              <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                {mockEnabled ? 'Mock Mode' : 'Connected to 8080'}
              </p>
            </button>
          </div>
        </div>

        {/* Footer: Switch to User App & Sign Out */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 space-y-2">
          <button
            onClick={switchToUserPortal}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Open Listener App
            </span>
            <span>&rarr;</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 text-xs font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Backstage</span>
          </button>
        </div>
      </aside>
    </>
  );
};
