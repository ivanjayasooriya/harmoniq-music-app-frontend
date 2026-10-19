import React, { useEffect, useState } from 'react';
import { Library, Play, Plus, Trash2, Globe, Lock } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { api } from '../services/api';
import { Playlist } from '../types';

interface PlaylistsViewProps {
  onSelectPlaylist: (playlist: Playlist) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  onSelectPlaylist,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const { playTrack } = useAudio();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // New playlist form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCover, setNewCover] = useState('');
  const [newPublic, setNewPublic] = useState(true);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await api.playlists.getAll();
      setPlaylists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.playlists.create({
        title: newTitle.trim(),
        description: newDesc.trim() || 'A custom playlist created on SoundWave.',
        coverUrl: newCover.trim() || undefined,
        isPublic: newPublic,
      });
      setPlaylists([created, ...playlists]);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewCover('');
    } catch (err) {
      console.error('Failed to create playlist', err);
    }
  };

  const handleDeletePlaylist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await api.playlists.delete(id);
      setPlaylists(playlists.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete playlist', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Library className="w-7 h-7 text-emerald-400" />
            Your Playlists
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Create, curate, and share custom listening collections
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Grid of Playlists */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => onSelectPlaylist(playlist)}
            className="group p-3.5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700/80 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg mb-3">
              <img
                src={playlist.coverUrl}
                alt={playlist.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (playlist.tracks.length > 0) {
                    playTrack(playlist.tracks[0], playlist.tracks);
                  }
                }}
                className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-emerald-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition shadow-xl"
                title="Play playlist"
              >
                <Play className="w-4 h-4 fill-black ml-0.5" />
              </button>
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-bold text-sm text-white truncate group-hover:text-emerald-400">
                  {playlist.title}
                </h3>
                <button
                  onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-1 transition"
                  title="Delete playlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5 line-clamp-1">
                {playlist.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-500 font-mono">
                <span>{playlist.trackCount} tracks</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {playlist.isPublic ? (
                    <Globe className="w-3 h-3 text-zinc-400" />
                  ) : (
                    <Lock className="w-3 h-3 text-zinc-400" />
                  )}
                  {playlist.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Playlist Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-zinc-100">
            <div>
              <h3 className="text-xl font-bold text-white">New Playlist</h3>
              <p className="text-xs text-zinc-400 mt-1">Give your playlist a title and vibe</p>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Playlist Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Late Night Synth Drives"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Tell listeners what this playlist is about..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={newCover}
                  onChange={(e) => setNewCover(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-zinc-300">Public Playlist</span>
                <input
                  type="checkbox"
                  checked={newPublic}
                  onChange={(e) => setNewPublic(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
