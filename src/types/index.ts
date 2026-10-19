export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  genre: string;
  plays: number;
  likes: number;
  releaseYear: number;
  explicit?: boolean;
  lyrics?: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  coverUrl: string;
  avatarUrl: string;
  monthlyListeners: number;
  verified: boolean;
  genres: string[];
  albumsCount: number;
  tracksCount: number;
  followed?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  creatorName: string;
  creatorId: string;
  isPublic: boolean;
  trackCount: number;
  tracks: Track[];
  createdAt: string;
}

export type UserRole = 'USER' | 'ADMIN' | 'ARTIST';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: UserRole;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  plan: 'Free' | 'Premium HiFi';
  favoriteGenres: string[];
  totalHoursListened: number;
  topArtist?: string;
  createdAt: string;
}

export interface Genre {
  id: string;
  name: string;
  color: string;
  trackCount: number;
  description: string;
  iconName?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeStreams: number;
  totalTracks: number;
  totalArtists: number;
  platformRevenue: number;
  dailyPlays: { day: string; plays: number; streams: number }[];
  genreBreakdown: { genre: string; percentage: number; color: string }[];
  recentActivities: {
    id: string;
    type: 'upload' | 'ban' | 'verify' | 'user' | 'stream';
    description: string;
    timestamp: string;
    user?: string;
  }[];
}

export type ViewMode =
  | 'home'
  | 'search'
  | 'playlists'
  | 'playlist-detail'
  | 'liked-songs'
  | 'artists'
  | 'artist-detail'
  | 'profile'
  | 'admin-dashboard'
  | 'music-management'
  | 'artist-management'
  | 'user-management'
  | 'banned-users'
  | 'genre-management'
  | 'ban-page'
  | 'sign-in'
  | 'sign-up'
  | 'forgot-password';
