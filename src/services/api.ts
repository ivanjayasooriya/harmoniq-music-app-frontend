import {
  ActivityItem,
  APIResponse,
  Artist,
  BanAppeal,
  DashboardStats,
  Genre,
  Playlist,
  Track,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_ARTISTS,
  INITIAL_DASHBOARD_STATS,
  INITIAL_GENRES,
  INITIAL_PLAYLISTS,
  INITIAL_TRACKS,
  INITIAL_USERS,
} from './mockData';

const STORAGE_KEY_API_URL = 'harmoniq_backend_url';
const STORAGE_KEY_USE_MOCK = 'harmoniq_use_mock';
const STORAGE_KEY_TOKEN = 'harmoniq_auth_token';

// Default Spring Boot base URL with /api/v1
export const getStoredBackendUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY_API_URL) || 'http://localhost:8080/api/v1';
};

export const setStoredBackendUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEY_API_URL, url);
};

export const isMockModeEnabled = (): boolean => {
  const val = localStorage.getItem(STORAGE_KEY_USE_MOCK);
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

// URL builder that prevents duplicate /api or /api/v1 prefix
export const buildUrl = (rawBase: string, endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let base = rawBase.trim().replace(/\/+$/, '');

  // If base already contains /api/v1 and endpoint starts with /api/v1, strip prefix
  if (base.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1/')) {
    return `${base}${cleanEndpoint.slice('/api/v1'.length)}`;
  }

  // If base ends with /api and endpoint starts with /api/v1, strip /api from base
  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/v1/')) {
    base = base.slice(0, -4);
  }

  return `${base}${cleanEndpoint}`;
};

// Local storage cache keys
const LOCAL_TRACKS_KEY = 'harmoniq_data_tracks';
const LOCAL_PLAYLISTS_KEY = 'harmoniq_data_playlists';
const LOCAL_ARTISTS_KEY = 'harmoniq_data_artists';
const LOCAL_GENRES_KEY = 'harmoniq_data_genres';
const LOCAL_USERS_KEY = 'harmoniq_data_users';
const LOCAL_LIKED_KEY = 'harmoniq_liked_track_ids';
const LOCAL_APPEALS_KEY = 'harmoniq_ban_appeals';

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

let localTracks: Track[] = loadLocal(LOCAL_TRACKS_KEY, INITIAL_TRACKS);
let localPlaylists: Playlist[] = loadLocal(LOCAL_PLAYLISTS_KEY, INITIAL_PLAYLISTS);
let localArtists: Artist[] = loadLocal(LOCAL_ARTISTS_KEY, INITIAL_ARTISTS);
let localGenres: Genre[] = loadLocal(LOCAL_GENRES_KEY, INITIAL_GENRES);
let localUsers: User[] = loadLocal(LOCAL_USERS_KEY, INITIAL_USERS);
let localLikedIds: string[] = loadLocal(LOCAL_LIKED_KEY, ['trk-1', 'trk-2', 'trk-3']);
let localAppeals: BanAppeal[] = loadLocal(LOCAL_APPEALS_KEY, []);

const persist = () => {
  saveLocal(LOCAL_TRACKS_KEY, localTracks);
  saveLocal(LOCAL_PLAYLISTS_KEY, localPlaylists);
  saveLocal(LOCAL_ARTISTS_KEY, localArtists);
  saveLocal(LOCAL_GENRES_KEY, localGenres);
  saveLocal(LOCAL_USERS_KEY, localUsers);
  saveLocal(LOCAL_LIKED_KEY, localLikedIds);
  saveLocal(LOCAL_APPEALS_KEY, localAppeals);
};

// Smart fetch with unwrapping of Spring Boot APIResponse<T>
async function apiRequest<T>(
  endpoints: string | string[],
  options: RequestInit = {},
  fallbackFn: () => Promise<T> | T
): Promise<T> {
  if (isMockModeEnabled()) {
    return fallbackFn();
  }

  const base = getStoredBackendUrl();
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const endpointList = Array.isArray(endpoints) ? endpoints : [endpoints];

  for (const ep of endpointList) {
    try {
      const url = buildUrl(base, ep);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        // Unwrap APIResponse<T> { code, message, data } if present
        if (json && typeof json === 'object' && 'data' in json && json.data !== undefined) {
          return json.data as T;
        }
        return json as T;
      }
    } catch {
      // try next variant
    }
  }

  return fallbackFn();
}

export const api = {
  // Backend Health Ping
  checkBackendHealth: async (): Promise<{ ok: boolean; message: string; latencyMs: number }> => {
    const start = performance.now();
    const rawBase = getStoredBackendUrl();
    const testEndpoints = [
      '/api/v1/music/all',
      '/api/v1/genre/all',
      '/api/v1/activity/all',
      '/actuator/health',
      '/health',
    ];

    for (const ep of testEndpoints) {
      try {
        const url = buildUrl(rawBase, ep);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(url, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);

        const latencyMs = Math.round(performance.now() - start);
        if (res.ok) {
          return {
            ok: true,
            message: `Connected to HarmoniQ Spring Boot at ${url} (${latencyMs}ms)`,
            latencyMs,
          };
        }
      } catch {
        // try next
      }
    }

    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: false,
      message: `Could not reach Spring Boot at ${rawBase}. Using interactive Mock Mode for instant preview.`,
      latencyMs,
    };
  },

  // AuthController (/api/v1/auth/*)
  auth: {
    login: async (email: string, password?: string): Promise<{ token: string; user: User }> => {
      return apiRequest(
        ['/api/v1/auth/signin', '/api/v1/auth/login'],
        {
          method: 'POST',
          body: JSON.stringify({ email, username: email, password: password || '123456' }),
        },
        async () => {
          const user =
            localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
            localUsers[0];
          const token = `harmoniq-jwt-${user.id}-${Date.now()}`;
          setAuthToken(token);
          return { token, user };
        }
      );
    },

    register: async (data: {
      email: string;
      username: string;
      fullName: string;
      password?: string;
      role?: UserRole;
    }): Promise<{ token: string; user: User }> => {
      return apiRequest(
        ['/api/v1/auth/signup', '/api/v1/auth/register'],
        {
          method: 'POST',
          body: JSON.stringify({
            email: data.email,
            userName: data.username,
            name: data.fullName,
            password: data.password || 'password123',
            role: data.role || 'USER',
          }),
        },
        async () => {
          const newUser: User = {
            id: `usr-${Date.now()}`,
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            avatarUrl:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            role: data.role || 'USER',
            isBanned: false,
            plan: 'Premium HiFi',
            favoriteGenres: ['Synthwave & Electronic', 'Pop & Modern Hits'],
            totalHoursListened: 0,
            createdAt: new Date().toISOString().split('T')[0],
          };
          localUsers.push(newUser);
          persist();
          const token = `harmoniq-jwt-${newUser.id}-${Date.now()}`;
          setAuthToken(token);
          return { token, user: newUser };
        }
      );
    },

    // EmailController (/api/v1/email/*)
    sendOtp: async (email: string): Promise<{ success: boolean; message: string }> => {
      return apiRequest(
        ['/api/v1/email/send-otp', '/api/v1/email/send', '/api/v1/auth/forgot-password'],
        { method: 'POST', body: JSON.stringify({ email, recipient: email }) },
        async () => ({ success: true, message: `Verification OTP dispatched to ${email}` })
      );
    },

    verifyOtp: async (otp: string): Promise<{ success: boolean }> => {
      return apiRequest(
        ['/api/v1/email/verify-otp', '/api/v1/email/validate-otp', '/api/v1/auth/validate-otp'],
        { method: 'POST', body: JSON.stringify({ otp }) },
        async () => ({ success: true })
      );
    },

    resetPassword: async (otp: string, newPass: string): Promise<{ success: boolean }> => {
      return apiRequest(
        ['/api/v1/email/reset-password', '/api/v1/auth/reset-password'],
        { method: 'POST', body: JSON.stringify({ otp, newPassword: newPass }) },
        async () => ({ success: true })
      );
    },

    // UserController (/api/v1/user/*)
    updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
      return apiRequest(
        [`/api/v1/user/update/${userId}`, `/api/v1/user/${userId}`, `/api/v1/user/update`],
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

  // MusicController (/api/v1/music/*)
  tracks: {
    getAll: async (): Promise<Track[]> => {
      return apiRequest(
        ['/api/v1/music/all', '/api/v1/music'],
        { method: 'GET' },
        () => [...localTracks]
      );
    },

    search: async (query: string): Promise<Track[]> => {
      return apiRequest(
        [`/api/v1/music/search?query=${encodeURIComponent(query)}`, `/api/v1/music/search?q=${encodeURIComponent(query)}`],
        { method: 'GET' },
        () => {
          const q = query.toLowerCase();
          return localTracks.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.artist.toLowerCase().includes(q) ||
              t.album.toLowerCase().includes(q) ||
              t.genre.toLowerCase().includes(q)
          );
        }
      );
    },

    // LikedSongController (/api/v1/liked-song/*)
    getLikedTracks: async (): Promise<Track[]> => {
      const activeUserId = localStorage.getItem('harmoniq_active_user_id') || 'usr-1';
      return apiRequest(
        [`/api/v1/liked-song/all/${activeUserId}`, '/api/v1/liked-song/all', '/api/v1/liked/all'],
        { method: 'GET' },
        () => localTracks.filter((t) => localLikedIds.includes(t.id))
      );
    },

    toggleLike: async (trackId: string): Promise<{ liked: boolean }> => {
      const activeUserId = localStorage.getItem('harmoniq_active_user_id') || 'usr-1';
      return apiRequest(
        [
          '/api/v1/liked-song/save',
          `/api/v1/liked-song/toggle/${trackId}`,
          `/api/v1/liked/toggle/${trackId}`,
        ],
        {
          method: 'POST',
          body: JSON.stringify({ userId: activeUserId, musicId: trackId, songId: trackId }),
        },
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
          return { liked: !exists };
        }
      );
    },

    createTrack: async (trackData: Omit<Track, 'id' | 'plays' | 'likes'>): Promise<Track> => {
      return apiRequest(
        ['/api/v1/music/save', '/api/v1/music/add', '/api/v1/music'],
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
        [`/api/v1/music/update/${id}`, `/api/v1/music/${id}`],
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
        [`/api/v1/music/delete/${id}`, `/api/v1/music/${id}`],
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

  // ArtistController (/api/v1/artist/*) & FollowedArtistController (/api/v1/followed-artist/*)
  artists: {
    getAll: async (): Promise<Artist[]> => {
      return apiRequest(
        ['/api/v1/artist/all', '/api/v1/artist'],
        { method: 'GET' },
        () => [...localArtists]
      );
    },

    toggleFollow: async (artistId: string): Promise<{ followed: boolean }> => {
      const activeUserId = localStorage.getItem('harmoniq_active_user_id') || 'usr-1';
      return apiRequest(
        [
          '/api/v1/followed-artist/save',
          `/api/v1/artist/follow/${artistId}`,
          `/api/v1/followed-artist/toggle/${artistId}`,
        ],
        {
          method: 'POST',
          body: JSON.stringify({ userId: activeUserId, artistId }),
        },
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
        ['/api/v1/artist/save', '/api/v1/artist/add', '/api/v1/artist'],
        { method: 'POST', body: JSON.stringify(data) },
        () => {
          const newArtist: Artist = {
            ...data,
            id: `art-${Date.now()}`,
            monthlyListeners: 1400,
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
        [`/api/v1/artist/update/${id}`, `/api/v1/artist/${id}`],
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
        [`/api/v1/artist/delete/${id}`, `/api/v1/artist/${id}`],
        { method: 'DELETE' },
        () => {
          localArtists = localArtists.filter((a) => a.id !== id);
          persist();
          return true;
        }
      );
    },
  },

  // PlaylistController (/api/v1/playlist/*) & PlaylistSongController (/api/v1/playlist-song/*)
  playlists: {
    getAll: async (): Promise<Playlist[]> => {
      const activeUserId = localStorage.getItem('harmoniq_active_user_id') || 'usr-1';
      return apiRequest(
        [`/api/v1/playlist/user/${activeUserId}`, '/api/v1/playlist/all', '/api/v1/playlist'],
        { method: 'GET' },
        () => [...localPlaylists]
      );
    },

    create: async (data: { title: string; description: string; coverUrl?: string; isPublic?: boolean }): Promise<Playlist> => {
      const activeUserId = localStorage.getItem('harmoniq_active_user_id') || 'usr-1';
      return apiRequest(
        ['/api/v1/playlist/save', '/api/v1/playlist/create', '/api/v1/playlist'],
        {
          method: 'POST',
          body: JSON.stringify({
            title: data.title,
            name: data.title,
            description: data.description,
            coverUrl: data.coverUrl,
            userId: activeUserId,
            isPublic: data.isPublic ?? true,
          }),
        },
        () => {
          const newPl: Playlist = {
            id: `pl-${Date.now()}`,
            title: data.title,
            description: data.description,
            coverUrl:
              data.coverUrl ||
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
            creatorName: 'Ivan Jayasooriya',
            creatorId: activeUserId,
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

    delete: async (id: string): Promise<boolean> => {
      return apiRequest(
        [`/api/v1/playlist/delete/${id}`, `/api/v1/playlist/${id}`],
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
        ['/api/v1/playlist-song/save', '/api/v1/playlist-song/add'],
        {
          method: 'POST',
          body: JSON.stringify({ playlistId, musicId: track.id, songId: track.id }),
        },
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
        [
          `/api/v1/playlist-song/delete/${playlistId}/${trackId}`,
          `/api/v1/playlist-song/delete?playlistId=${playlistId}&songId=${trackId}`,
        ],
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

  // GenreController (/api/v1/genre/*)
  genres: {
    getAll: async (): Promise<Genre[]> => {
      return apiRequest(
        ['/api/v1/genre/all', '/api/v1/genre/with-track-count', '/api/v1/genre'],
        { method: 'GET' },
        () => [...localGenres]
      );
    },

    create: async (data: Omit<Genre, 'id' | 'trackCount'>): Promise<Genre> => {
      return apiRequest(
        ['/api/v1/genre/save', '/api/v1/genre/add', '/api/v1/genre'],
        { method: 'POST', body: JSON.stringify(data) },
        () => {
          const newG: Genre = { ...data, id: `g-${Date.now()}`, trackCount: 0 };
          localGenres.push(newG);
          persist();
          return newG;
        }
      );
    },

    delete: async (id: string): Promise<boolean> => {
      return apiRequest(
        [`/api/v1/genre/delete/${id}`, `/api/v1/genre/${id}`],
        { method: 'DELETE' },
        () => {
          localGenres = localGenres.filter((g) => g.id !== id);
          persist();
          return true;
        }
      );
    },
  },

  // UserController, UserBanController, ActivityController (/api/v1/*)
  admin: {
    // ActivityController (/api/v1/activity/*)
    getStats: async (): Promise<DashboardStats> => {
      return apiRequest(
        ['/api/v1/activity/all', '/api/v1/activity'],
        { method: 'GET' },
        () => ({
          ...INITIAL_DASHBOARD_STATS,
          totalTracks: localTracks.length + 45200,
          totalArtists: localArtists.length + 1835,
          totalUsers: localUsers.length + 248916,
        })
      );
    },

    getUsers: async (): Promise<User[]> => {
      return apiRequest(
        ['/api/v1/user/all', '/api/v1/user'],
        { method: 'GET' },
        () => [...localUsers]
      );
    },

    updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
      return apiRequest(
        [`/api/v1/user/role/${userId}`, `/api/v1/user/update/${userId}`],
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

    // UserBanController (/api/v1/ban/* or /api/v1/user-ban/*)
    getBannedUsers: async (): Promise<User[]> => {
      return apiRequest(
        ['/api/v1/ban/all', '/api/v1/user-ban/all', '/api/v1/ban'],
        { method: 'GET' },
        () => localUsers.filter((u) => u.isBanned)
      );
    },

    banUser: async (userId: string, reason: string): Promise<User> => {
      const adminId = localStorage.getItem('harmoniq_active_user_id') || 'usr-1';
      return apiRequest(
        ['/api/v1/ban/save', '/api/v1/user-ban/save', '/api/v1/ban/user'],
        {
          method: 'POST',
          body: JSON.stringify({ userId, reason, adminId }),
        },
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
        [`/api/v1/ban/unban/${userId}`, `/api/v1/user-ban/unban/${userId}`],
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

    // BanAppealDTO (/api/v1/ban/appeal)
    submitBanAppeal: async (data: { userId: string; username: string; reason: string }): Promise<BanAppeal> => {
      return apiRequest(
        ['/api/v1/ban/appeal', '/api/v1/user-ban/appeal'],
        { method: 'POST', body: JSON.stringify(data) },
        () => {
          const appeal: BanAppeal = {
            id: `app-${Date.now()}`,
            userId: data.userId,
            username: data.username,
            reason: data.reason,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          };
          localAppeals.push(appeal);
          persist();
          return appeal;
        }
      );
    },
  },

  // ChatController (/api/v1/chat/*)
  chat: {
    sendPrompt: async (message: string): Promise<{ reply: string }> => {
      return apiRequest(
        ['/api/v1/chat', '/api/v1/chat/send'],
        { method: 'POST', body: JSON.stringify({ message, prompt: message }) },
        async () => {
          const replies = [
            `Based on your listening history, "Neon Skyline" by Aether Echoes matches your sonic profile. Enjoy the high-fidelity master!`,
            `For a deep focus flow session, "Midnight Rain In Shibuya" by Solaris Drift is recommended.`,
            `Nova Eclipse's "Starlight Gravity" is currently topping the global charts in lossless quality.`,
          ];
          return { reply: replies[Math.floor(Math.random() * replies.length)] };
        }
      );
    },
  },
};
