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

export const getStoredBackendUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY_API_URL) || 'http://localhost:8080/api';
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

// Persistence helper for local storage
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

const LOCAL_TRACKS_KEY = 'harmoniq_data_tracks';
const LOCAL_PLAYLISTS_KEY = 'harmoniq_data_playlists';
const LOCAL_ARTISTS_KEY = 'harmoniq_data_artists';
const LOCAL_GENRES_KEY = 'harmoniq_data_genres';
const LOCAL_USERS_KEY = 'harmoniq_data_users';
const LOCAL_LIKED_KEY = 'harmoniq_liked_track_ids';
const LOCAL_APPEALS_KEY = 'harmoniq_ban_appeals';

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

  const baseUrl = getStoredBackendUrl().replace(/\/+$/, '');
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const endpointList = Array.isArray(endpoints) ? endpoints : [endpoints];

  for (const ep of endpointList) {
    try {
      const url = `${baseUrl}${ep.startsWith('/') ? ep : `/${ep}`}`;
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
        // Unwrap APIResponse<T> { data: ... } if present
        if (json && typeof json === 'object' && 'data' in json && json.data !== undefined) {
          return json.data as T;
        }
        return json as T;
      }
    } catch {
      // try next endpoint or fallback
    }
  }

  return fallbackFn();
}

export const api = {
  checkBackendHealth: async (): Promise<{ ok: boolean; message: string; latencyMs: number }> => {
    const start = performance.now();
    const baseUrl = getStoredBackendUrl().replace(/\/+$/, '');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() =>
        fetch(`${baseUrl.replace('/api', '')}/actuator/health`, {
          method: 'GET',
          signal: controller.signal,
        })
      );
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - start);
      if (res && res.ok) {
        return { ok: true, message: `Connected to HarmoniQ Spring Boot backend (${latencyMs}ms)`, latencyMs };
      }
      return { ok: false, message: `Server replied with status ${res?.status || 'unreachable'}`, latencyMs };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const errorMsg = err instanceof Error ? err.message : 'Connection failed';
      return {
        ok: false,
        message: `Could not reach Spring Boot at ${baseUrl} (${errorMsg}). Mock mode active.`,
        latencyMs,
      };
    }
  },

  // AuthController endpoints
  auth: {
    login: async (email: string, password?: string): Promise<{ token: string; user: User }> => {
      return apiRequest(
        ['/auth/signin', '/auth/login'],
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
        ['/auth/signup', '/auth/register'],
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

    sendOtp: async (email: string): Promise<{ success: boolean; message: string }> => {
      return apiRequest(
        ['/email/send-otp', '/auth/forgot-password'],
        { method: 'POST', body: JSON.stringify({ email, recipient: email }) },
        async () => ({ success: true, message: `Verification OTP dispatched to ${email}` })
      );
    },

    verifyOtp: async (otp: string): Promise<{ success: boolean }> => {
      return apiRequest(
        ['/email/verify-otp', '/auth/validate-otp'],
        { method: 'POST', body: JSON.stringify({ otp }) },
        async () => ({ success: true })
      );
    },

    resetPassword: async (otp: string, newPass: string): Promise<{ success: boolean }> => {
      return apiRequest(
        ['/auth/reset-password'],
        { method: 'POST', body: JSON.stringify({ otp, newPassword: newPass }) },
        async () => ({ success: true })
      );
    },

    updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
      return apiRequest(
        [`/user/update/${userId}`, `/user/${userId}`],
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

  // MusicController endpoints
  tracks: {
    getAll: async (): Promise<Track[]> => {
      return apiRequest(['/music/all', '/tracks'], { method: 'GET' }, () => [...localTracks]);
    },

    search: async (query: string): Promise<Track[]> => {
      return apiRequest(
        [`/music/search?query=${encodeURIComponent(query)}`, `/tracks/search?q=${encodeURIComponent(query)}`],
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

    getLikedTracks: async (): Promise<Track[]> => {
      return apiRequest(['/liked/all', '/tracks/liked'], { method: 'GET' }, () => {
        return localTracks.filter((t) => localLikedIds.includes(t.id));
      });
    },

    toggleLike: async (trackId: string): Promise<{ liked: boolean }> => {
      return apiRequest(
        [`/liked/toggle/${trackId}`, `/tracks/${trackId}/like`],
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
          return { liked: !exists };
        }
      );
    },

    createTrack: async (trackData: Omit<Track, 'id' | 'plays' | 'likes'>): Promise<Track> => {
      return apiRequest(
        ['/music/add', '/tracks'],
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
        [`/music/update/${id}`, `/tracks/${id}`],
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
        [`/music/delete/${id}`, `/tracks/${id}`],
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

  // ArtistController & FollowedArtistController
  artists: {
    getAll: async (): Promise<Artist[]> => {
      return apiRequest(['/artist/all', '/artists'], { method: 'GET' }, () => [...localArtists]);
    },

    toggleFollow: async (artistId: string): Promise<{ followed: boolean }> => {
      return apiRequest(
        [`/artist/follow/${artistId}`, `/artists/${artistId}/follow`],
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
        ['/artist/add', '/artists'],
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
        [`/artist/update/${id}`, `/artists/${id}`],
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
        [`/artist/delete/${id}`, `/artists/${id}`],
        { method: 'DELETE' },
        () => {
          localArtists = localArtists.filter((a) => a.id !== id);
          persist();
          return true;
        }
      );
    },
  },

  // PlaylistController & PlaylistSongController
  playlists: {
    getAll: async (): Promise<Playlist[]> => {
      return apiRequest(['/playlist/all', '/playlists'], { method: 'GET' }, () => [...localPlaylists]);
    },

    create: async (data: { title: string; description: string; coverUrl?: string; isPublic?: boolean }): Promise<Playlist> => {
      return apiRequest(
        ['/playlist/create', '/playlists'],
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

    delete: async (id: string): Promise<boolean> => {
      return apiRequest(
        [`/playlist/delete/${id}`, `/playlists/${id}`],
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
        ['/playlist/song/add', `/playlists/${playlistId}/tracks`],
        { method: 'POST', body: JSON.stringify({ playlistId, songId: track.id, trackId: track.id }) },
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
        [`/playlist/song/delete/${playlistId}/${trackId}`, `/playlists/${playlistId}/tracks/${trackId}`],
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

  // GenreController
  genres: {
    getAll: async (): Promise<Genre[]> => {
      return apiRequest(['/genre/all', '/genre/with-track-count', '/genres'], { method: 'GET' }, () => [
        ...localGenres,
      ]);
    },

    create: async (data: Omit<Genre, 'id' | 'trackCount'>): Promise<Genre> => {
      return apiRequest(
        ['/genre/add', '/genres'],
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
        [`/genre/delete/${id}`, `/genres/${id}`],
        { method: 'DELETE' },
        () => {
          localGenres = localGenres.filter((g) => g.id !== id);
          persist();
          return true;
        }
      );
    },
  },

  // UserController & UserBanController & ActivityController
  admin: {
    getStats: async (): Promise<DashboardStats> => {
      return apiRequest(['/activity/all', '/admin/stats'], { method: 'GET' }, () => ({
        ...INITIAL_DASHBOARD_STATS,
        totalTracks: localTracks.length + 45200,
        totalArtists: localArtists.length + 1835,
        totalUsers: localUsers.length + 248916,
      }));
    },

    getUsers: async (): Promise<User[]> => {
      return apiRequest(['/user/all', '/admin/users'], { method: 'GET' }, () => [...localUsers]);
    },

    updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
      return apiRequest(
        [`/user/role/${userId}`, `/admin/users/${userId}/role`],
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

    getBannedUsers: async (): Promise<User[]> => {
      return apiRequest(['/ban/all', '/admin/users/banned'], { method: 'GET' }, () =>
        localUsers.filter((u) => u.isBanned)
      );
    },

    banUser: async (userId: string, reason: string): Promise<User> => {
      return apiRequest(
        ['/ban/user', `/admin/users/${userId}/ban`],
        { method: 'POST', body: JSON.stringify({ userId, reason }) },
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
        [`/ban/unban/${userId}`, `/admin/users/${userId}/unban`],
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

    submitBanAppeal: async (data: { userId: string; username: string; reason: string }): Promise<BanAppeal> => {
      return apiRequest(
        ['/ban/appeal'],
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

  // AI Chat (ChatController.java)
  chat: {
    sendPrompt: async (message: string): Promise<{ reply: string }> => {
      return apiRequest(
        ['/chat', '/api/chat'],
        { method: 'POST', body: JSON.stringify({ message, prompt: message }) },
        async () => {
          const replies = [
            `Based on your taste in synthwave and ambient beats, you will love "Neon Skyline" by Aether Echoes! Would you like me to queue it up?`,
            `I recommend diving into Solaris Drift's "Midnight Rain In Shibuya" for a focused study or work session.`,
            `Nova Eclipse just released "Starlight Gravity" in ultra lossless master quality. Great choice for high-energy afternoons!`,
          ];
          return { reply: replies[Math.floor(Math.random() * replies.length)] };
        }
      );
    },
  },
};
