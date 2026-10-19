import React, { useEffect, useState } from 'react';
import {
  Edit3,
  Filter,
  Music,
  Play,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { api } from '../services/api';
import { Genre, Track } from '../types';

export const MusicManagementView: React.FC = () => {
  const { playTrack } = useAudio();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formArtist, setFormArtist] = useState('');
  const [formAlbum, setFormAlbum] = useState('');
  const [formGenre, setFormGenre] = useState('Synthwave & Electronic');
  const [formDuration, setFormDuration] = useState('210');
  const [formCover, setFormCover] = useState('');
  const [formAudio, setFormAudio] = useState('');
  const [formLyrics, setFormLyrics] = useState('');
  const [formExplicit, setFormExplicit] = useState(false);

  const fetchData = async () => {
    const [tList, gList] = await Promise.all([api.tracks.getAll(), api.genres.getAll()]);
    setTracks(tList);
    setGenres(gList);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openUploadModal = () => {
    setEditingTrack(null);
    setFormTitle('');
    setFormArtist('');
    setFormAlbum('');
    setFormGenre(genres[0]?.name || 'Synthwave & Electronic');
    setFormDuration('210');
    setFormCover('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80');
    setFormAudio('https://actions.google.com/sounds/v1/science_fiction/scifi_hum.ogg');
    setFormLyrics('');
    setFormExplicit(false);
    setIsUploadModalOpen(true);
  };

  const openEditModal = (track: Track) => {
    setEditingTrack(track);
    setFormTitle(track.title);
    setFormArtist(track.artist);
    setFormAlbum(track.album);
    setFormGenre(track.genre);
    setFormDuration(track.duration.toString());
    setFormCover(track.coverUrl);
    setFormAudio(track.audioUrl);
    setFormLyrics(track.lyrics || '');
    setFormExplicit(!!track.explicit);
    setIsUploadModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formArtist.trim()) return;

    if (editingTrack) {
      const updated = await api.tracks.updateTrack(editingTrack.id, {
        title: formTitle.trim(),
        artist: formArtist.trim(),
        album: formAlbum.trim() || 'Single',
        genre: formGenre,
        duration: parseInt(formDuration, 10) || 180,
        coverUrl: formCover.trim(),
        audioUrl: formAudio.trim(),
        lyrics: formLyrics.trim(),
        explicit: formExplicit,
      });
      setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const created = await api.tracks.createTrack({
        title: formTitle.trim(),
        artist: formArtist.trim(),
        artistId: `art-${Date.now()}`,
        album: formAlbum.trim() || 'Single',
        genre: formGenre,
        duration: parseInt(formDuration, 10) || 180,
        coverUrl: formCover.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        audioUrl: formAudio.trim() || 'https://actions.google.com/sounds/v1/science_fiction/scifi_hum.ogg',
        releaseYear: new Date().getFullYear(),
        lyrics: formLyrics.trim(),
        explicit: formExplicit,
      });
      setTracks([created, ...tracks]);
    }

    setIsUploadModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this track from the catalog?')) return;
    await api.tracks.deleteTrack(id);
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = tracks.filter((t) => {
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || t.genre === selectedGenre;
    return matchesQuery && matchesGenre;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Music className="w-7 h-7 text-cyan-400" />
            Music Catalog Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage audio tracks, metadata, audio sources, and genre categorizations
          </p>
        </div>

        <button
          onClick={openUploadModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Track</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter catalog tracks..."
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedGenre('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedGenre === 'All'
                ? 'bg-cyan-500 text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedGenre === g.name
                  ? 'bg-cyan-500 text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tracks Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
        <div className="divide-y divide-zinc-800/50">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-2.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider select-none bg-zinc-950/40">
            <span className="flex-1">Track & Artist</span>
            <span className="hidden md:block w-36">Genre</span>
            <span className="hidden sm:block w-28 text-right">Plays</span>
            <span className="hidden sm:block w-20 text-right">Duration</span>
            <span className="w-24 text-right">Actions</span>
          </div>

          {/* Rows */}
          {filtered.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/40 transition group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  onClick={() => playTrack(track, filtered)}
                  className="relative group/play cursor-pointer shrink-0"
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/play:opacity-100 flex items-center justify-center transition">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                  <p className="text-xs text-zinc-400 truncate">
                    {track.artist} • <span className="text-zinc-500">{track.album}</span>
                  </p>
                </div>
              </div>

              <span className="hidden md:block text-xs text-zinc-300 truncate w-36">
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[11px] border border-zinc-700/60">
                  {track.genre}
                </span>
              </span>

              <span className="hidden sm:block text-xs font-mono text-zinc-400 w-28 text-right">
                {track.plays.toLocaleString()}
              </span>

              <span className="hidden sm:block text-xs font-mono text-zinc-400 w-20 text-right">
                {Math.floor(track.duration / 60)}:
                {(track.duration % 60).toString().padStart(2, '0')}
              </span>

              <div className="flex items-center justify-end gap-1.5 w-24">
                <button
                  onClick={() => openEditModal(track)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  title="Edit Track"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(track.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
                  title="Delete Track"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload / Edit Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingTrack ? 'Edit Track' : 'Upload Track to Catalog'}
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Track Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Lunar Horizons"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formArtist}
                    onChange={(e) => setFormArtist(e.target.value)}
                    placeholder="e.g. Aether Echoes"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Album / Single
                  </label>
                  <input
                    type="text"
                    value={formAlbum}
                    onChange={(e) => setFormAlbum(e.target.value)}
                    placeholder="e.g. Cosmic Voyage"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Genre
                  </label>
                  <select
                    value={formGenre}
                    onChange={(e) => setFormGenre(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {genres.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formCover}
                    onChange={(e) => setFormCover(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Audio Stream URL (.mp3, .ogg, or CDN URL)
                  </label>
                  <input
                    type="url"
                    value={formAudio}
                    onChange={(e) => setFormAudio(e.target.value)}
                    placeholder="https://actions.google.com/sounds/..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Lyrics
                </label>
                <textarea
                  rows={4}
                  value={formLyrics}
                  onChange={(e) => setFormLyrics(e.target.value)}
                  placeholder="Paste track lyrics here..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-300 font-medium">Explicit Track Rating</span>
                <input
                  type="checkbox"
                  checked={formExplicit}
                  onChange={(e) => setFormExplicit(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition shadow-lg shadow-cyan-500/20"
                >
                  {editingTrack ? 'Save Changes' : 'Upload Song'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
