import React from 'react';
import {
  Compass,
  Heart,
  Home,
  Library,
  MessageSquareHeart,
  PlusCircle,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { UserView } from '../types';
import { HarmoniQLogo } from './HarmoniQLogo';

interface UserSidebarProps {
  currentView: UserView;
  onNavigate: (view: UserView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onCreatePlaylist: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  onCreatePlaylist,
}) => {
  const { user, isAdmin, switchToAdminPortal } = useAuth();
  const { likedTrackIds } = useAudio();

  const handleNav = (view: UserView) => {
    onNavigate(view);
    onCloseMobile();
  };

  const navClass = (active: boolean) =>
    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 font-semibold shadow-sm border border-emerald-500/20'
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
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-zinc-950/95 lg:bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800/80">
          <div
            onClick={() => handleNav('home')}
            className="cursor-pointer group inline-block"
          >
            <HarmoniQLogo size="md" />
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Discover Section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Discover
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('home')}
                className={`w-full ${navClass(currentView === 'home')}`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleNav('search')}
                className={`w-full ${navClass(currentView === 'search')}`}
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Search & Explore</span>
              </button>

              <button
                onClick={() => handleNav('artists')}
                className={`w-full ${navClass(currentView === 'artists' || currentView === 'artist-detail')}`}
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>Artists</span>
              </button>

              <button
                onClick={() => handleNav('ai-chat')}
                className={`w-full ${navClass(currentView === 'ai-chat')}`}
              >
                <MessageSquareHeart className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="flex-1 text-left">HarmoniQ AI DJ</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  AI
                </span>
              </button>
            </nav>
          </div>

          {/* Library Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
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
                className={`w-full ${navClass(currentView === 'playlists' || currentView === 'playlist-detail')}`}
              >
                <Library className="w-4 h-4 shrink-0" />
                <span>Playlists</span>
              </button>

              <button
                onClick={() => handleNav('liked-songs')}
                className={`w-full ${navClass(currentView === 'liked-songs')}`}
              >
                <Heart
                  className={`w-4 h-4 shrink-0 ${
                    likedTrackIds.length > 0 ? 'text-rose-500 fill-rose-500' : ''
                  }`}
                />
                <span className="flex-1 text-left">Liked Songs</span>
                {likedTrackIds.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                    {likedTrackIds.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Footer: User Profile Badge & Admin Quick Switch if authorized */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 space-y-2">
          {isAdmin && (
            <button
              onClick={() => switchToAdminPortal()}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Switch to Admin Portal
              </span>
              <span className="text-[10px] font-mono">&rarr;</span>
            </button>
          )}

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
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Listener'}</p>
              <p className="text-[10px] text-zinc-400 truncate">
                {user?.plan || 'Premium HiFi'} • {user?.totalHoursListened || 142} hrs
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
