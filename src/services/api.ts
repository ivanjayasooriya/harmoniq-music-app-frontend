import {
  Artist,
  DashboardStats,
  Genre,
  Playlist,
  Track,
  User,
  UserRole
} from '../types';
import {
  INITIAL_ARTISTS,
  INITIAL_DASHBOARD_STATS,
  INITIAL_GENRES,
  INITIAL_PLAYLISTS,
  INITIAL_TRACKS,
  INITIAL_USERS,
} from './mockData';

const STORAGE_KEY_API_URL = 'soundwave_backend_url';
const STORAGE_KEY_USE_MOCK = 'soundwave_use_mock';
const STORAGE_KEY_TOKEN = 'soundwave_auth_token';

export const getStoredBackendUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY_API_URL) || 'http://localhost:8080/api';
};

export const setStoredBackendUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEY_API_URL, url);
};

export const isMockModeEnabled = (): boolean => {
  const val = localStorage.getItem(STORAGE_KEY_USE_MOCK);
  // Default to true if not explicitly set so the UI always works smoothly even without the user's local server running
  return val === null ? true : val === 'true';
};

export const setMockMode = (enabled: boolean) => {
  localStorage.setItem(STORAGE_KEY_USE_MOCK, enabled ? 'true' : 'false');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_TOKEN);
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }
};

// In-memory state persistent across sessions via localStorage
const loadLocal = <T>(key: string, defaultVal: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const saveLocal = <T>(key: string, val: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
};

// Local storage state keys
const LOCAL_TRACKS_KEY = 'soundwave_data_tracks';
const LOCAL_PLAYLISTS_KEY = 'soundwave_data_playlists';
const LOCAL_ARTISTS_KEY = 'soundwave_data_artists';
const LOCAL_GENRES_KEY = 'soundwave_data_genres';
const LOCAL_USERS_KEY = 'soundwave_data_users';
const LOCAL_LIKED_KEY = 'soundwave_liked_track_ids';

let localTracks: Track[] = loadLocal(LOCAL_TRACKS_KEY, INITIAL_TRACKS);
let localPlaylists: Playlist[] = loadLocal(LOCAL_PLAYLISTS_KEY, INITIAL_PLAYLISTS);
let localArtists: Artist[] = loadLocal(LOCAL_ARTISTS_KEY, INITIAL_ARTISTS);
let localGenres: Genre[] = loadLocal(LOCAL_GENRES_KEY, INITIAL_GENRES);
let localUsers: User[] = loadLocal(LOCAL_USERS_KEY, INITIAL_USERS);
let localLikedIds: string[] = loadLocal(LOCAL_LIKED_KEY, ['trk-1', 'trk-2', 'trk-3']);

const persist = () => {
  saveLocal(LOCAL_TRACKS_KEY, localTracks);
  saveLocal(LOCAL_PLAYLISTS_KEY, localPlaylists);
  saveLocal(LOCAL_ARTISTS_KEY, localArtists);
  saveLocal(LOCAL_GENRES_KEY, localGenres);
  saveLocal(LOCAL_USERS_KEY, localUsers);
  saveLocal(LOCAL_LIKED_KEY, localLikedIds);
};

// Helper fetcher with backend check
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackFn: () => Promise<T> | T
): Promise<T> {
  if (isMockModeEnabled()) {
    return fallbackFn();
  }

  const baseUrl = getStoredBackendUrl();
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[SoundWave Backend] Could not connect to SpringBoot at ${baseUrl}${endpoint}, using mock fallback.`, err);
    return fallbackFn();
  }
}

export const api = {
  // Backend Connection Test
  checkBackendHealth: async (): Promise<{ ok: boolean; message: string; latencyMs: number }> => {
    const start = performance.now();
    const baseUrl = getStoredBackendUrl();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => fetch(`${baseUrl.replace('/api', '')}/actuator/health`, {
        method: 'GET',
        signal: controller.signal,
      }));
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - start);
      if (res && res.ok) {
        return { ok: true, message: `Connected to Spring Boot successfully (${latencyMs}ms)`, latencyMs };
      }
      return { ok: false, message: `Server replied with status ${res?.status || 'unreachable'}`, latencyMs };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const errorMsg = err instanceof Error ? err.message : 'Connection failed';
      return {
        ok: false,
        message: `Unable to reach Spring Boot at ${baseUrl} (${errorMsg}). Switch to Mock Mode for instant preview.`,
        latencyMs,
      };
    }
  },

  // Auth & User Profile
  auth: {
    login: async (email: string, _password?: string): Promise<{ token: string; user: User }> => {
      return apiRequest(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password: _password }) },
        async () => {
          const user = localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || localUsers[0];
          const token = `mock-jwt-token-${user.id}-${Date.now()}`;
          setAuthToken(token);
          return { token, user };
        }
      );
    },

    register: async (data: { email: string; username: string; fullName: string; role?: UserRole }): Promise<{ token: string; user: User }> => {
      return apiRequest(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(data) },
        async () => {
          const newUser: User = {
            id: `usr-${Date.now()}`,
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
            role: data.role || 'USER',
            isBanned: false,
            plan: 'Free',
            favoriteGenres: ['Synthwave & Electronic', 'Pop & Modern Hits'],
            totalHoursListened: 0,
            createdAt: new Date().toISOString().split('T')[0],
          };
          localUsers.push(newUser);
          persist();
          const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
          setAuthToken(token);
          return { token, user: newUser };
        }
      );
    },

    forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
      return apiRequest(
        '/auth/forgot-password',
        { method: 'POST', body: JSON.stringify({ email }) },
        async () => ({ success: true, message: `Password reset instructions sent to ${email}` })
      );
    },

    resetPassword: async (_token: string, _newPass: string): Promise<{ success: boolean; message: string }> => {
      return apiRequest(
        '/auth/reset-password',
        { method: 'POST', body: JSON.stringify({ token: _token, newPassword: _newPass }) },
        async () => ({ success: true, message: 'Password has been updated successfully.' })
      );
    },

    updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
      return apiRequest(
        `/users/${userId}`,
        { method: 'PUT', body: JSON.stringify(data) },
        async () => {
          const idx = localUsers.findIndex((u) => u.id === userId);
          if (idx !== -1) {
            localUsers[idx] = { ...localUsers[idx], ...data };
            persist();
            return localUsers[idx];
          }
          throw new Error('User not found');
        }
      );
    },
  },

  // Tracks API
  tracks: {
    getAll: async (): Promise<Track[]> => {
      return apiRequest('/tracks', { method: 'GET' }, () => [...localTracks]);
    },

    getById: async (id: string): Promise<Track | undefined> => {
      return apiRequest(`/tracks/${id}`, { method: 'GET' }, () => localTracks.find((t) => t.id === id));
    },

    search: async (query: string): Promise<Track[]> => {
      return apiRequest(`/tracks/search?q=${encodeURIComponent(query)}`, { method: 'GET' }, () => {
        const q = query.toLowerCase();
        return localTracks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q) ||
            t.album.toLowerCase().includes(q) ||
            t.genre.toLowerCase().includes(q)
        );
      });
    },

    getLikedTracks: async (): Promise<Track[]> => {
      return apiRequest('/tracks/liked', { method: 'GET' }, () => {
        return localTracks.filter((t) => localLikedIds.includes(t.id));
      });
    },

    toggleLike: async (trackId: string): Promise<{ liked: boolean; totalLikes: number }> => {
      return apiRequest(
        `/tracks/${trackId}/like`,
        { method: 'POST' },
        () => {
          const exists = localLikedIds.includes(trackId);
          if (exists) {
            localLikedIds = localLikedIds.filter((id) => id !== trackId);
          } else {
            localLikedIds.push(trackId);
          }
          const trk = localTracks.find((t) => t.id === trackId);
          if (trk) {
            trk.likes += exists ? -1 : 1;
          }
          persist();
          return { liked: !exists, totalLikes: trk ? trk.likes : 0 };
        }
      );
    },

    createTrack: async (trackData: Omit<Track, 'id' | 'plays' | 'likes'>): Promise<Track> => {
      return apiRequest(
        '/tracks',
        { method: 'POST', body: JSON.stringify(trackData) },
        () => {
          const newTrack: Track = {
            ...trackData,
            id: `trk-${Date.now()}`,
            plays: 0,
            likes: 0,
          };
          localTracks.unshift(newTrack);
          persist();
          return newTrack;
        }
      );
    },

    updateTrack: async (id: string, data: Partial<Track>): Promise<Track> => {
      return apiRequest(
        `/tracks/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        () => {
          const idx = localTracks.findIndex((t) => t.id === id);
          if (idx !== -1) {
            localTracks[idx] = { ...localTracks[idx], ...data };
            persist();
            return localTracks[idx];
          }
          throw new Error('Track not found');
        }
      );
    },

    deleteTrack: async (id: string): Promise<boolean> => {
      return apiRequest(
        `/tracks/${id}`,
        { method: 'DELETE' },
        () => {
          localTracks = localTracks.filter((t) => t.id !== id);
          localLikedIds = localLikedIds.filter((tid) => tid !== id);
          persist();
          return true;
        }
      );
    },
  },

  // Playlists API
  playlists: {
    getAll: async (): Promise<Playlist[]> => {
      return apiRequest('/playlists', { method: 'GET' }, () => [...localPlaylists]);
    },

    getById: async (id: string): Promise<Playlist | undefined> => {
      return apiRequest(`/playlists/${id}`, { method: 'GET' }, () => localPlaylists.find((p) => p.id === id));
    },

    create: async (data: { title: string; description: string; coverUrl?: string; isPublic?: boolean }): Promise<Playlist> => {
      return apiRequest(
        '/playlists',
        { method: 'POST', body: JSON.stringify(data) },
        () => {
          const newPl: Playlist = {
            id: `pl-${Date.now()}`,
            title: data.title,
            description: data.description,
            coverUrl:
              data.coverUrl ||
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
            creatorName: 'Ivan Jayasooriya',
            creatorId: 'usr-1',
            isPublic: data.isPublic ?? true,
            trackCount: 0,
            tracks: [],
            createdAt: new Date().toISOString().split('T')[0],
          };
          localPlaylists.unshift(newPl);
          persist();
          return newPl;
        }
      );
    },

    update: async (id: string, data: Partial<Playlist>): Promise<Playlist> => {
      return apiRequest(
        `/playlists/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        () => {
          const idx = localPlaylists.findIndex((p) => p.id === id);
          if (idx !== -1) {
            localPlaylists[idx] = { ...localPlaylists[idx], ...data };
            persist();
            return localPlaylists[idx];
          }
          throw new Error('Playlist not found');
        }
      );
    },

    delete: async (id: string): Promise<boolean> => {
      return apiRequest(
        `/playlists/${id}`,
        { method: 'DELETE' },
        () => {
          localPlaylists = localPlaylists.filter((p) => p.id !== id);
          persist();
          return true;
        }
      );
    },

    addTrack: async (playlistId: string, track: Track): Promise<Playlist> => {
      return apiRequest(
        `/playlists/${playlistId}/tracks`,
        { method: 'POST', body: JSON.stringify({ trackId: track.id }) },
        () => {
          const pl = localPlaylists.find((p) => p.id === playlistId);
          if (pl) {
            if (!pl.tracks.some((t) => t.id === track.id)) {
              pl.tracks.push(track);
              pl.trackCount = pl.tracks.length;
              persist();
            }
            return pl;
          }
          throw new Error('Playlist not found');
        }
      );
    },

    removeTrack: async (playlistId: string, trackId: string): Promise<Playlist> => {
      return apiRequest(
        `/playlists/${playlistId}/tracks/${trackId}`,
        { method: 'DELETE' },
        () => {
          const pl = localPlaylists.find((p) => p.id === playlistId);
          if (pl) {
            pl.tracks = pl.tracks.filter((t) => t.id !== trackId);
            pl.trackCount = pl.tracks.length;
            persist();
            return pl;
          }
          throw new Error('Playlist not found');
        }
      );
    },
  },

  // Artists API
  artists: {
    getAll: async (): Promise<Artist[]> => {
      return apiRequest('/artists', { method: 'GET' }, () => [...localArtists]);
    },

    getById: async (id: string): Promise<Artist | undefined> => {
      return apiRequest(`/artists/${id}`, { method: 'GET' }, () => localArtists.find((a) => a.id === id));
    },

    toggleFollow: async (artistId: string): Promise<{ followed: boolean }> => {
      return apiRequest(
        `/artists/${artistId}/follow`,
        { method: 'POST' },
        () => {
          const art = localArtists.find((a) => a.id === artistId);
          if (art) {
            art.followed = !art.followed;
            art.monthlyListeners += art.followed ? 1 : -1;
            persist();
            return { followed: !!art.followed };
          }
          return { followed: false };
        }
      );
    },

    createArtist: async (data: Omit<Artist, 'id' | 'monthlyListeners' | 'albumsCount' | 'tracksCount'>): Promise<Artist> => {
      return apiRequest(
        '/artists',
        { method: 'POST', body: JSON.stringify(data) },
        () => {
          const newArtist: Artist = {
            ...data,
            id: `art-${Date.now()}`,
            monthlyListeners: 1200,
            albumsCount: 1,
            tracksCount: 1,
            followed: false,
          };
          localArtists.push(newArtist);
          persist();
          return newArtist;
        }
      );
    },

    updateArtist: async (id: string, data: Partial<Artist>): Promise<Artist> => {
      return apiRequest(
        `/artists/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        () => {
          const idx = localArtists.findIndex((a) => a.id === id);
          if (idx !== -1) {
            localArtists[idx] = { ...localArtists[idx], ...data };
            persist();
            return localArtists[idx];
          }
          throw new Error('Artist not found');
        }
      );
    },

    deleteArtist: async (id: string): Promise<boolean> => {
      return apiRequest(
        `/artists/${id}`,
        { method: 'DELETE' },
        () => {
          localArtists = localArtists.filter((a) => a.id !== id);
          persist();
          return true;
        }
      );
    },
  },

  // Genres API
  genres: {
    getAll: async (): Promise<Genre[]> => {
      return apiRequest('/genres', { method: 'GET' }, () => [...localGenres]);
    },

    create: async (data: Omit<Genre, 'id' | 'trackCount'>): Promise<Genre> => {
      return apiRequest(
        '/genres',
        { method: 'POST', body: JSON.stringify(data) },
        () => {
          const newG: Genre = {
            ...data,
            id: `g-${Date.now()}`,
            trackCount: 0,
          };
          localGenres.push(newG);
          persist();
          return newG;
        }
      );
    },

    delete: async (id: string): Promise<boolean> => {
      return apiRequest(
        `/genres/${id}`,
        { method: 'DELETE' },
        () => {
          localGenres = localGenres.filter((g) => g.id !== id);
          persist();
          return true;
        }
      );
    },
  },

  // Admin & User Management
  admin: {
    getStats: async (): Promise<DashboardStats> => {
      return apiRequest('/admin/stats', { method: 'GET' }, () => ({
        ...INITIAL_DASHBOARD_STATS,
        totalTracks: localTracks.length + 45200,
        totalArtists: localArtists.length + 1835,
        totalUsers: localUsers.length + 248916,
      }));
    },

    getUsers: async (): Promise<User[]> => {
      return apiRequest('/admin/users', { method: 'GET' }, () => [...localUsers]);
    },

    getBannedUsers: async (): Promise<User[]> => {
      return apiRequest('/admin/users/banned', { method: 'GET' }, () => localUsers.filter((u) => u.isBanned));
    },

    updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
      return apiRequest(
        `/admin/users/${userId}/role`,
        { method: 'PUT', body: JSON.stringify({ role }) },
        () => {
          const user = localUsers.find((u) => u.id === userId);
          if (user) {
            user.role = role;
            persist();
            return user;
          }
          throw new Error('User not found');
        }
      );
    },

    banUser: async (userId: string, reason: string): Promise<User> => {
      return apiRequest(
        `/admin/users/${userId}/ban`,
        { method: 'POST', body: JSON.stringify({ reason }) },
        () => {
          const user = localUsers.find((u) => u.id === userId);
          if (user) {
            user.isBanned = true;
            user.banReason = reason;
            user.bannedAt = new Date().toISOString().split('T')[0];
            persist();
            return user;
          }
          throw new Error('User not found');
        }
      );
    },

    unbanUser: async (userId: string): Promise<User> => {
      return apiRequest(
        `/admin/users/${userId}/unban`,
        { method: 'POST' },
        () => {
          const user = localUsers.find((u) => u.id === userId);
          if (user) {
            user.isBanned = false;
            user.banReason = undefined;
            user.bannedAt = undefined;
            persist();
            return user;
          }
          throw new Error('User not found');
        }
      );
    },
  },
};
