import React, { useState } from 'react';
import {
  Clock,
  Crown,
  Edit2,
  Headphones,
  Music,
  Save,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_GENRES } from '../services/mockData';

export const UserProfileView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(user?.favoriteGenres || []);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName: fullName.trim(),
      username: username.trim(),
      avatarUrl: avatarUrl.trim() || user.avatarUrl,
      favoriteGenres: selectedGenres,
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleGenre = (genreName: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreName) ? prev.filter((g) => g !== genreName) : [...prev, genreName]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/40 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover shadow-2xl border-2 border-emerald-500/40"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              {user.plan}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono text-zinc-400 bg-zinc-800">
              Role: {user.role}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">{user.fullName}</h1>
          <p className="text-sm text-zinc-400">@{user.username} • {user.email}</p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Profile updated successfully!
        </div>
      )}

      {/* Profile Edit Mode */}
      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="p-6 md:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6 shadow-xl"
        >
          <h2 className="text-lg font-bold text-white tracking-tight">Edit Profile Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Favorite Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {INITIAL_GENRES.map((g) => {
                const selected = selectedGenres.includes(g.name);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      selected
                        ? 'bg-emerald-500 text-black font-semibold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                    }`}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        /* Listening Habits & Stats */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Listening Time */}
          <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Time Streamed
            </p>
            <p className="text-3xl font-extrabold text-white">
              {user.totalHoursListened} <span className="text-sm font-normal text-zinc-400">hours</span>
            </p>
            <p className="text-xs text-zinc-500">Continuous lossless audio play</p>
          </div>

          {/* Card 2: Favorite Top Artist */}
          <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Top Artist
            </p>
            <p className="text-2xl font-extrabold text-white truncate">
              {user.topArtist || 'Aether Echoes'}
            </p>
            <p className="text-xs text-zinc-500">Your most streamed producer this month</p>
          </div>

          {/* Card 3: Membership Status */}
          <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Audio Quality
            </p>
            <p className="text-2xl font-extrabold text-white">FLAC 24-bit</p>
            <p className="text-xs text-zinc-500">192kHz Master Audio Quality Enabled</p>
          </div>
        </div>
      )}

      {/* Favorite Genres Shelf */}
      <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Music className="w-4 h-4 text-emerald-400" />
          Favorite Genres & Vibe Taste
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {user.favoriteGenres.map((genre) => (
            <span
              key={genre}
              className="px-3.5 py-1.5 rounded-full bg-zinc-800/80 text-zinc-200 text-xs font-semibold border border-zinc-700/80"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
