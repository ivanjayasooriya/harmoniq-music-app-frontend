import React, { useEffect, useState } from 'react';
import { Clock, Heart, Play, Search, Shuffle } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Track } from '../types';

export const LikedSongsView: React.FC = () => {
  const { playTrack, currentTrack, likedTrackIds, toggleLike, toggleShuffle } = useAudio();
  const { user } = useAuth();
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        setLoading(true);
        const songs = await api.tracks.getLikedTracks();
        setLikedSongs(songs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiked();
  }, [likedTrackIds]);

  const filtered = filterQuery.trim()
    ? likedSongs.filter(
        (s) =>
          s.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          s.artist.toLowerCase().includes(filterQuery.toLowerCase()) ||
          s.album.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : likedSongs;

  const totalSeconds = likedSongs.reduce((acc, t) => acc + t.duration, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playTrack(likedSongs[0], likedSongs);
    }
  };

  const handleShufflePlay = () => {
    if (likedSongs.length > 0) {
      toggleShuffle();
      const randomIdx = Math.floor(Math.random() * likedSongs.length);
      playTrack(likedSongs[randomIdx], likedSongs);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900/60 to-zinc-950 border border-indigo-500/20 shadow-2xl">
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shrink-0">
          <Heart className="w-20 h-20 text-white fill-white" />
        </div>

        <div className="space-y-2 text-center md:text-left flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Personal Library
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Liked Songs
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-medium text-zinc-300 pt-1">
            <span className="font-semibold text-white">{user?.fullName || 'You'}</span>
            <span>•</span>
            <span>{likedSongs.length} songs</span>
            <span>•</span>
            <span className="text-zinc-400 font-mono">{totalMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Action Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayAll}
            disabled={likedSongs.length === 0}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>Play All</span>
          </button>

          <button
            onClick={handleShufflePlay}
            disabled={likedSongs.length === 0}
            className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition active:scale-95 disabled:opacity-50"
            title="Shuffle play"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search liked songs..."
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Songs Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Heart className="w-12 h-12 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-300 font-medium">No liked songs found</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Click the heart icon on any track in the catalog to add it to your favorites.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {/* Header */}
            <div className="flex items-center gap-4 px-4 py-2.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider select-none bg-zinc-950/40">
              <span className="w-6 text-center">#</span>
              <span className="flex-1">Title</span>
              <span className="hidden md:block w-48">Album</span>
              <span className="w-24 text-right flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Song rows */}
            {filtered.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, filtered)}
                  className={`group flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/50 cursor-pointer transition ${
                    isCurrent ? 'bg-indigo-500/10' : ''
                  }`}
                >
                  <span className="w-6 text-center text-xs font-mono text-zinc-400 group-hover:hidden">
                    {idx + 1}
                  </span>
                  <div className="w-6 text-center hidden group-hover:flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>

                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-indigo-400' : 'text-zinc-100 group-hover:text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <span className="hidden md:block text-xs text-zinc-400 truncate w-48">
                    {track.album}
                  </span>

                  <div className="flex items-center justify-end gap-3 w-24">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className="p-1 text-rose-500 hover:text-rose-400 transition"
                      title="Unlike"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                    <span className="text-xs font-mono text-zinc-400">
                      {Math.floor(track.duration / 60)}:
                      {(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
