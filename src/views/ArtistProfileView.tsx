import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Disc,
  Heart,
  Play,
  Shuffle,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { api } from '../services/api';
import { Artist, Track } from '../types';

interface ArtistProfileViewProps {
  artist: Artist;
  onBack: () => void;
}

export const ArtistProfileView: React.FC<ArtistProfileViewProps> = ({ artist, onBack }) => {
  const { playTrack, currentTrack, isLiked, toggleLike, toggleShuffle } = useAudio();
  const [currentArtist, setCurrentArtist] = useState<Artist>(artist);
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [followed, setFollowed] = useState<boolean>(!!artist.followed);

  useEffect(() => {
    setCurrentArtist(artist);
    setFollowed(!!artist.followed);
    const loadTracks = async () => {
      const all = await api.tracks.getAll();
      const filtered = all.filter(
        (t) => t.artistId === artist.id || t.artist.toLowerCase() === artist.name.toLowerCase()
      );
      setArtistTracks(filtered.length > 0 ? filtered : all.slice(0, 4));
    };
    loadTracks();
  }, [artist]);

  const handleToggleFollow = async () => {
    const res = await api.artists.toggleFollow(currentArtist.id);
    setFollowed(res.followed);
    setCurrentArtist((prev) => ({
      ...prev,
      monthlyListeners: prev.monthlyListeners + (res.followed ? 1 : -1),
    }));
  };

  const handlePlayPopular = () => {
    if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks);
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
        Back to Artists
      </button>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-6 md:p-10 border border-zinc-800 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentArtist.coverUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            {currentArtist.verified && (
              <>
                <BadgeCheck className="w-4 h-4" />
                <span>Verified Artist</span>
              </>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            {currentArtist.name}
          </h1>

          <p className="text-zinc-300 text-sm font-medium">
            {(currentArtist.monthlyListeners).toLocaleString()} monthly listeners
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handlePlayPopular}
              disabled={artistTracks.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play</span>
            </button>

            <button
              onClick={handleToggleFollow}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition border ${
                followed
                  ? 'bg-zinc-800/80 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-900/80 text-white border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              {followed ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Follow
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Popular Tracks Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Popular Releases</h2>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
          {artistTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, artistTracks)}
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
                    <p className="text-xs text-zinc-400 truncate">{track.album}</p>
                  </div>
                </div>

                <span className="hidden sm:block text-xs font-mono text-zinc-400 w-28 text-right">
                  {track.plays.toLocaleString()} plays
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 transition"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isLiked(track.id) ? 'text-rose-500 fill-rose-500' : ''
                    }`}
                  />
                </button>

                <span className="text-xs font-mono text-zinc-400 w-12 text-right">
                  {Math.floor(track.duration / 60)}:
                  {(track.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">About {currentArtist.name}</h2>
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">{currentArtist.bio}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {currentArtist.genres.map((genre) => (
              <span
                key={genre}
                className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
