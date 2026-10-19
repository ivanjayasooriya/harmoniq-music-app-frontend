export interface APIResponse<T> {
  code: number | string;
  message: string;
  data: T;
}

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

export type UserRole = 'USER' | 'ADMIN';

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
}

export interface BanAppeal {
  id: string;
  userId: string;
  username: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'upload' | 'ban' | 'verify' | 'user' | 'stream';
  description: string;
  timestamp: string;
  user?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeStreams: number;
  totalTracks: number;
  totalArtists: number;
  platformRevenue: number;
  dailyPlays: { day: string; plays: number; streams: number }[];
  genreBreakdown: { genre: string; percentage: number; color: string }[];
  recentActivities: ActivityItem[];
}

export type ActivePortal = 'user' | 'admin' | 'auth' | 'banned';

export type UserView =
  | 'home'
  | 'search'
  | 'playlists'
  | 'playlist-detail'
  | 'liked-songs'
  | 'artists'
  | 'artist-detail'
  | 'profile'
  | 'ai-chat';

export type AdminView =
  | 'dashboard'
  | 'music'
  | 'artists'
  | 'users'
  | 'banned'
  | 'genres';

export type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password';
