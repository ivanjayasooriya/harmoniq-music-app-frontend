import React, { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Edit2,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { Artist } from '../types';

export const ArtistManagementView: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [genresInput, setGenresInput] = useState('');
  const [verified, setVerified] = useState(false);

  const fetchArtists = async () => {
    const data = await api.artists.getAll();
    setArtists(data);
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const openAddModal = () => {
    setEditingArtist(null);
    setName('');
    setBio('');
    setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setCoverUrl('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80');
    setGenresInput('Synthwave & Electronic, Pop & Modern Hits');
    setVerified(true);
    setIsModalOpen(true);
  };

  const openEditModal = (artist: Artist) => {
    setEditingArtist(artist);
    setName(artist.name);
    setBio(artist.bio);
    setAvatarUrl(artist.avatarUrl);
    setCoverUrl(artist.coverUrl);
    setGenresInput(artist.genres.join(', '));
    setVerified(artist.verified);
    setIsModalOpen(true);
  };

  const handleToggleVerified = async (artist: Artist) => {
    const updated = await api.artists.updateArtist(artist.id, { verified: !artist.verified });
    setArtists((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this artist from the roster?')) return;
    await api.artists.deleteArtist(id);
    setArtists((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const genreList = genresInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    if (editingArtist) {
      const updated = await api.artists.updateArtist(editingArtist.id, {
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        coverUrl: coverUrl.trim(),
        genres: genreList,
        verified,
      });
      setArtists((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } else {
      const created = await api.artists.createArtist({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        coverUrl: coverUrl.trim(),
        genres: genreList,
        verified,
      });
      setArtists([created, ...artists]);
    }
    setIsModalOpen(false);
  };

  const filtered = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <UserCheck className="w-7 h-7 text-amber-400" />
            Artist Roster Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage creator profiles, verified checks, and listener analytics
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Artist</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search artist name or genres..."
          className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      {/* Artists Roster Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
        <div className="divide-y divide-zinc-800/50">
          <div className="flex items-center gap-4 px-4 py-2.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider select-none bg-zinc-950/40">
            <span className="flex-1">Artist Profile</span>
            <span className="hidden md:block w-32">Status</span>
            <span className="hidden sm:block w-36 text-right">Monthly Listeners</span>
            <span className="w-28 text-right">Actions</span>
          </div>

          {filtered.map((artist) => (
            <div
              key={artist.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/40 transition group"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-11 h-11 rounded-full object-cover shrink-0 border border-zinc-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-white truncate">{artist.name}</p>
                    {artist.verified && (
                      <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate">
                    {artist.genres.slice(0, 2).join(' • ')}
                  </p>
                </div>
              </div>

              <div className="hidden md:block w-32">
                <button
                  onClick={() => handleToggleVerified(artist)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition ${
                    artist.verified
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {artist.verified ? 'Verified' : 'Unverified'}
                </button>
              </div>

              <span className="hidden sm:block text-xs font-mono text-zinc-300 w-36 text-right">
                {artist.monthlyListeners.toLocaleString()}
              </span>

              <div className="flex items-center justify-end gap-1.5 w-28">
                <button
                  onClick={() => openEditModal(artist)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  title="Edit Artist"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(artist.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
                  title="Delete Artist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Artist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingArtist ? 'Edit Artist Profile' : 'Add New Artist'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Artist / Band Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Solaris Drift"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Bio / Artist Description
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell listeners about the artist's story..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Genres (Comma separated)
                </label>
                <input
                  type="text"
                  value={genresInput}
                  onChange={(e) => setGenresInput(e.target.value)}
                  placeholder="e.g. Lo-Fi Chill & Study, Synthwave & Electronic"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-300 font-medium">Verified Artist Badge</span>
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition shadow-lg shadow-amber-500/20"
                >
                  {editingArtist ? 'Save Profile' : 'Add Artist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
