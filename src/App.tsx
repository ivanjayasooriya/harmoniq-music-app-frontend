import React, { useState } from 'react';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar } from './components/AdminSidebar';
import { BackendConfigModal } from './components/BackendConfigModal';
import { FullscreenPlayer } from './components/FullscreenPlayer';
import { LyricsModal } from './components/LyricsModal';
import { Navbar } from './components/Navbar';
import { PlayerBar } from './components/PlayerBar';
import { QueueDrawer } from './components/QueueDrawer';
import { UserSidebar } from './components/UserSidebar';
import { AudioProvider } from './context/AudioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminView, Artist, AuthMode, Playlist, UserView } from './types';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AIChatView } from './views/AIChatView';
import { ArtistManagementView } from './views/ArtistManagementView';
import { ArtistProfileView } from './views/ArtistProfileView';
import { ArtistsView } from './views/ArtistsView';
import { AuthViews } from './views/AuthViews';
import { BannedUsersView } from './views/BannedUsersView';
import { BanPageView } from './views/BanPageView';
import { GenreManagementView } from './views/GenreManagementView';
import { LikedSongsView } from './views/LikedSongsView';
import { MusicManagementView } from './views/MusicManagementView';
import { PlaylistDetailView } from './views/PlaylistDetailView';
import { PlaylistsView } from './views/PlaylistsView';
import { SearchPageView } from './views/SearchPageView';
import { UserHomeView } from './views/UserHomeView';
import { UserManagementView } from './views/UserManagementView';
import { UserProfileView } from './views/UserProfileView';

function AppContent() {
  const { user, activePortal } = useAuth();

  // Navigation states for separated portals
  const [userView, setUserView] = useState<UserView>('home');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');

  // Shared entity selection
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  // Search & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);

  // 1. BANNED PORTAL (Account suspended)
  if (activePortal === 'banned' || user?.isBanned) {
    return <BanPageView />;
  }

  // 2. AUTHENTICATION PORTAL (Choose Listener or Admin login)
  if (activePortal === 'auth' || !user) {
    return <AuthViews mode={authMode} onSwitchMode={setAuthMode} />;
  }

  // 3. ADMIN BACKSTAGE PORTAL (Separated management experience)
  if (activePortal === 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <div className="flex-1 flex overflow-hidden">
          {/* Admin Dedicated Sidebar */}
          <AdminSidebar
            currentView={adminView}
            onNavigate={setAdminView}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onOpenBackendModal={() => setIsBackendModalOpen(true)}
          />

          {/* Admin Main Body */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-zinc-950">
            <AdminNavbar
              currentView={adminView}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              onOpenBackendModal={() => setIsBackendModalOpen(true)}
            />

            <main className="flex-1 px-4 md:px-8 py-6 pb-28 max-w-7xl w-full mx-auto">
              {adminView === 'dashboard' && (
                <AdminDashboardView
                  onNavigate={setAdminView}
                  onOpenBackendModal={() => setIsBackendModalOpen(true)}
                />
              )}
              {adminView === 'music' && <MusicManagementView />}
              {adminView === 'artists' && <ArtistManagementView />}
              {adminView === 'users' && <UserManagementView />}
              {adminView === 'banned' && <BannedUsersView />}
              {adminView === 'genres' && <GenreManagementView />}
            </main>
          </div>
        </div>

        {/* Player bar available in admin if previewing audio tracks */}
        <PlayerBar />

        {/* Backend configuration modal */}
        <BackendConfigModal
          isOpen={isBackendModalOpen}
          onClose={() => setIsBackendModalOpen(false)}
        />
      </div>
    );
  }

  // 4. LISTENER / USER PORTAL (Clean, high-fidelity music streaming app)
  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setUserView('playlist-detail');
  };

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setUserView('artist-detail');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-black">
      <div className="flex-1 flex overflow-hidden">
        {/* User Dedicated Sidebar (NO ADMIN CLUTTER) */}
        <UserSidebar
          currentView={userView}
          onNavigate={setUserView}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onCreatePlaylist={() => {
            setUserView('playlists');
            setIsCreatePlaylistModalOpen(true);
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Top Sticky Navbar */}
          <Navbar
            currentView={userView}
            onNavigate={setUserView}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenBackendModal={() => setIsBackendModalOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Page View Body */}
          <main className="flex-1 px-4 md:px-8 py-6 pb-32 max-w-7xl w-full mx-auto">
            {userView === 'home' && (
              <UserHomeView
                onNavigate={setUserView}
                onSelectPlaylist={handleSelectPlaylist}
                onSelectArtist={handleSelectArtist}
              />
            )}

            {userView === 'search' && (
              <SearchPageView
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectArtist={handleSelectArtist}
                onSelectPlaylist={handleSelectPlaylist}
              />
            )}

            {userView === 'artists' && (
              <ArtistsView onSelectArtist={handleSelectArtist} />
            )}

            {userView === 'artist-detail' && selectedArtist && (
              <ArtistProfileView
                artist={selectedArtist}
                onBack={() => setUserView('artists')}
              />
            )}

            {userView === 'ai-chat' && <AIChatView />}

            {userView === 'playlists' && (
              <PlaylistsView
                onSelectPlaylist={handleSelectPlaylist}
                isCreateModalOpen={isCreatePlaylistModalOpen}
                setIsCreateModalOpen={setIsCreatePlaylistModalOpen}
              />
            )}

            {userView === 'playlist-detail' && selectedPlaylist && (
              <PlaylistDetailView
                playlist={selectedPlaylist}
                onBack={() => setUserView('playlists')}
              />
            )}

            {userView === 'liked-songs' && <LikedSongsView />}

            {userView === 'profile' && <UserProfileView />}
          </main>
        </div>
      </div>

      {/* Persistent Bottom Audio Player Bar */}
      <PlayerBar />

      {/* Audio Drawers & Modals */}
      <QueueDrawer />
      <LyricsModal />
      <FullscreenPlayer />
      <BackendConfigModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
