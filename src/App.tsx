import React, { useState } from 'react';
import { BackendConfigModal } from './components/BackendConfigModal';
import { FullscreenPlayer } from './components/FullscreenPlayer';
import { LyricsModal } from './components/LyricsModal';
import { Navbar } from './components/Navbar';
import { PlayerBar } from './components/PlayerBar';
import { QueueDrawer } from './components/QueueDrawer';
import { Sidebar } from './components/Sidebar';
import { AudioProvider } from './context/AudioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Artist, Playlist, ViewMode } from './types';
import { AdminDashboardView } from './views/AdminDashboardView';
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
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);

  // If user account is marked banned, immediately display the Ban Page
  if (user?.isBanned && currentView !== 'ban-page') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center">
        <BanPageView onNavigate={setCurrentView} />
      </div>
    );
  }

  // Auth pages (full page centered)
  if (currentView === 'sign-in' || currentView === 'sign-up' || currentView === 'forgot-password') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center">
        <AuthViews mode={currentView} onNavigate={setCurrentView} />
      </div>
    );
  }

  // If view is ban-page directly (from manual preview)
  if (currentView === 'ban-page') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center">
        <BanPageView onNavigate={setCurrentView} />
      </div>
    );
  }

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentView('playlist-detail');
  };

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setCurrentView('artist-detail');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-black">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onCreatePlaylist={() => {
            setCurrentView('playlists');
            setIsCreatePlaylistModalOpen(true);
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Top Sticky Navbar */}
          <Navbar
            currentView={currentView}
            onNavigate={setCurrentView}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenBackendModal={() => setIsBackendModalOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Page View Body */}
          <main className="flex-1 px-4 md:px-8 py-6 pb-32 max-w-7xl w-full mx-auto">
            {currentView === 'home' && (
              <UserHomeView
                onNavigate={setCurrentView}
                onSelectPlaylist={handleSelectPlaylist}
                onSelectArtist={handleSelectArtist}
              />
            )}

            {currentView === 'search' && (
              <SearchPageView
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectArtist={handleSelectArtist}
                onSelectPlaylist={handleSelectPlaylist}
              />
            )}

            {currentView === 'playlists' && (
              <PlaylistsView
                onSelectPlaylist={handleSelectPlaylist}
                isCreateModalOpen={isCreatePlaylistModalOpen}
                setIsCreateModalOpen={setIsCreatePlaylistModalOpen}
              />
            )}

            {currentView === 'playlist-detail' && selectedPlaylist && (
              <PlaylistDetailView
                playlist={selectedPlaylist}
                onBack={() => setCurrentView('playlists')}
              />
            )}

            {currentView === 'liked-songs' && <LikedSongsView />}

            {currentView === 'artists' && (
              <ArtistsView onSelectArtist={handleSelectArtist} />
            )}

            {currentView === 'artist-detail' && selectedArtist && (
              <ArtistProfileView
                artist={selectedArtist}
                onBack={() => setCurrentView('artists')}
              />
            )}

            {currentView === 'profile' && <UserProfileView />}

            {currentView === 'admin-dashboard' && (
              <AdminDashboardView
                onNavigate={setCurrentView}
                onOpenBackendModal={() => setIsBackendModalOpen(true)}
              />
            )}

            {currentView === 'music-management' && <MusicManagementView />}

            {currentView === 'artist-management' && <ArtistManagementView />}

            {currentView === 'user-management' && <UserManagementView />}

            {currentView === 'banned-users' && <BannedUsersView />}

            {currentView === 'genre-management' && <GenreManagementView />}
          </main>
        </div>
      </div>

      {/* Persistent Bottom Audio Player Bar */}
      <PlayerBar />

      {/* Global Modals & Drawers */}
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
