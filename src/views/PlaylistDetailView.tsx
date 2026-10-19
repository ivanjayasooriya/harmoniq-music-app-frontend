import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Heart,
  Music,
  Play,
  Plus,
  Shuffle,
  Trash2,
  X,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { api } from '../services/api';
import { Playlist, Track } from '../types';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  onBack: () => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlist, onBack }) => {
  const { playTrack, currentTrack, isLiked, toggleLike, toggleShuffle } = useAudio();
  const [currentPl, setCurrentPl] = useState<Playlist>(playlist);
  const [allCatalogTracks, setAllCatalogTracks] = useState<Track[]>([]);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

  useEffect(() => {
    setCurrentPl(playlist);
    const loadTracks = async () => {
      const all = await api.tracks.getAll();
      setAllCatalogTracks(all);
    };
    loadTracks();
  }, [playlist]);

  const totalDuration = currentPl.tracks.reduce((acc, t) => acc + t.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  const handlePlayAll = () => {
    if (currentPl.tracks.length > 0) {
      playTrack(currentPl.tracks[0], currentPl.tracks);
    }
  };

  const handleShufflePlay = () => {
    if (currentPl.tracks.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * currentPl.tracks.length);
      playTrack(currentPl.tracks[randomIndex], currentPl.tracks);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    try {
      const updated = await api.playlists.removeTrack(currentPl.id, trackId);
      setCurrentPl({ ...updated });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTrack = async (track: Track) => {
    try {
      const updated = await api.playlists.addTrack(currentPl.id, track);
      setCurrentPl({ ...updated });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Playlists
      </button>

      {/* Playlist Hero Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 p-6 rounded-3xl bg-gradient-to-t from-zinc-900 to-zinc-900/40 border border-zinc-800">
        <img
          src={currentPl.coverUrl}
          alt={currentPl.title}
          className="w-44 h-44 md:w-52 md:h-52 rounded-2xl object-cover shadow-2xl shrink-0"
        />

        <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            {currentPl.isPublic ? 'Public Playlist' : 'Private Playlist'}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight truncate">
            {currentPl.title}
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">{currentPl.description}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-medium text-zinc-300">
            <span className="font-semibold text-white">{currentPl.creatorName}</span>
            <span>•</span>
            <span>{currentPl.tracks.length} songs</span>
            <span>•</span>
            <span className="text-zinc-400 font-mono">about {totalMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayAll}
            disabled={currentPl.tracks.length === 0}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>Play All</span>
          </button>

          <button
            onClick={handleShufflePlay}
            disabled={currentPl.tracks.length === 0}
            className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition active:scale-95 disabled:opacity-50"
            title="Shuffle play"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setIsAddSongModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Songs to Playlist</span>
        </button>
      </div>

      {/* Songs Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
        {currentPl.tracks.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Music className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-400">This playlist has no songs yet.</p>
            <button
              onClick={() => setIsAddSongModalOpen(true)}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Add songs from library
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {/* Header row */}
            <div className="flex items-center gap-4 px-4 py-2.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider select-none bg-zinc-950/40">
              <span className="w-6 text-center">#</span>
              <span className="flex-1">Title</span>
              <span className="hidden md:block w-44">Album</span>
              <span className="w-20 text-right flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <span className="w-12 text-right">Action</span>
            </div>

            {/* Song rows */}
            {currentPl.tracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track, currentPl.tracks)}
                  className={`group flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/50 cursor-pointer transition ${
                    isCurrent ? 'bg-emerald-500/10' : ''
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
                          isCurrent ? 'text-emerald-400' : 'text-zinc-100 group-hover:text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <span className="hidden md:block text-xs text-zinc-400 truncate w-44">
                    {track.album}
                  </span>

                  <div className="flex items-center justify-end gap-3 w-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className="p-1 text-zinc-400 hover:text-rose-500 transition"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked(track.id) ? 'text-rose-500 fill-rose-500' : ''
                        }`}
                      />
                    </button>
                    <span className="text-xs font-mono text-zinc-400">
                      {Math.floor(track.duration / 60)}:
                      {(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="w-12 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTrack(track.id);
                      }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition"
                      title="Remove from this playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Song Modal */}
      {isAddSongModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-zinc-100 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg text-white">Add Songs to "{currentPl.title}"</h3>
              <button
                onClick={() => setIsAddSongModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {allCatalogTracks.map((track) => {
                const alreadyAdded = currentPl.tracks.some((t) => t.id === track.id);
                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 transition border border-zinc-800"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                        <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddTrack(track)}
                      disabled={alreadyAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        alreadyAdded
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      }`}
                    >
                      {alreadyAdded ? 'Added' : 'Add Track'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
