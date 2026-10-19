import React from 'react';
import {
  Compass,
  Heart,
  Home,
  LayoutDashboard,
  Library,
  Music,
  PlusCircle,
  Radio,
  Search,
  Sliders,
  Tag,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  onCreatePlaylist,
}) => {
  const { user, isAdmin, isArtist } = useAuth();
  const { likedTrackIds } = useAudio();

  const handleNav = (view: ViewMode) => {
    onNavigate(view);
    onCloseMobile();
  };

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 font-semibold shadow-sm border border-emerald-500/20'
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-zinc-950/95 lg:bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 text-black animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                Sound<span className="text-emerald-400">Wave</span>
              </span>
              <span className="text-[10px] tracking-wider font-semibold text-zinc-400 uppercase mt-1 block">
                Hi-Fi Streaming
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Main Menu */}
          <div>
            <p className="px-3 text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Discover
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('home')}
                className={`w-full ${navItemClass(currentView === 'home')}`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleNav('search')}
                className={`w-full ${navItemClass(currentView === 'search')}`}
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Search & Explore</span>
              </button>

              <button
                onClick={() => handleNav('artists')}
                className={`w-full ${navItemClass(currentView === 'artists' || currentView === 'artist-detail')}`}
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>Artists</span>
              </button>
            </nav>
          </div>

          {/* User Library */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                My Library
              </p>
              <button
                onClick={onCreatePlaylist}
                title="Create New Playlist"
                className="text-zinc-400 hover:text-emerald-400 transition"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('playlists')}
                className={`w-full ${navItemClass(currentView === 'playlists' || currentView === 'playlist-detail')}`}
              >
                <Library className="w-4 h-4 shrink-0" />
                <span>Playlists</span>
              </button>

              <button
                onClick={() => handleNav('liked-songs')}
                className={`w-full ${navItemClass(currentView === 'liked-songs')}`}
              >
                <Heart className={`w-4 h-4 shrink-0 ${likedTrackIds.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                <span className="flex-1 text-left">Liked Songs</span>
                {likedTrackIds.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {likedTrackIds.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Admin & Studio Workspace */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Studio & Admin
              </p>
              {isAdmin && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30">
                  ADMIN
                </span>
              )}
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('admin-dashboard')}
                className={`w-full ${navItemClass(currentView === 'admin-dashboard')}`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>Overview Dashboard</span>
              </button>

              <button
                onClick={() => handleNav('music-management')}
                className={`w-full ${navItemClass(currentView === 'music-management')}`}
              >
                <Music className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Music Catalog</span>
              </button>

              <button
                onClick={() => handleNav('artist-management')}
                className={`w-full ${navItemClass(currentView === 'artist-management')}`}
              >
                <UserCheck className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Artist Roster</span>
              </button>

              <button
                onClick={() => handleNav('user-management')}
                className={`w-full ${navItemClass(currentView === 'user-management')}`}
              >
                <Users className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>User Management</span>
              </button>

              <button
                onClick={() => handleNav('banned-users')}
                className={`w-full ${navItemClass(currentView === 'banned-users')}`}
              >
                <UserX className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Banned Accounts</span>
              </button>

              <button
                onClick={() => handleNav('genre-management')}
                className={`w-full ${navItemClass(currentView === 'genre-management')}`}
              >
                <Tag className="w-4 h-4 shrink-0 text-purple-400" />
                <span>Genre Taxonomies</span>
              </button>
            </nav>
          </div>
        </div>

        {/* User Card & Role Switcher */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950">
          <div
            onClick={() => handleNav('profile')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 cursor-pointer transition"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
              alt={user?.fullName || 'User'}
              className="w-9 h-9 rounded-full object-cover border border-zinc-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'SoundWave User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                  {user?.role || 'USER'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
