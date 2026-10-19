import React, { useEffect, useState } from 'react';
import {
  Flame,
  Heart,
  MoreHorizontal,
  Play,
  Radio,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { api } from '../services/api';
import { Artist, Playlist, Track, ViewMode } from '../types';

interface UserHomeViewProps {
  onNavigate: (view: ViewMode) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectArtist: (artist: Artist) => void;
}

export const UserHomeView: React.FC<UserHomeViewProps> = ({
  onNavigate,
  onSelectPlaylist,
  onSelectArtist,
}) => {
  const { playTrack, currentTrack, isPlaying, isLiked, toggleLike } = useAudio();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allTracks, allPlaylists, allArtists] = await Promise.all([
          api.tracks.getAll(),
          api.playlists.getAll(),
          api.artists.getAll(),
        ]);
        setTracks(allTracks);
        setPlaylists(allPlaylists);
        setArtists(allArtists);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const heroTrack = tracks[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Stream high-fidelity master audio curated for you
          </p>
        </div>
      </div>

      {/* Hero Showcase Card */}
      {heroTrack && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-950 border border-emerald-500/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SOUNDWAVE EDITORIAL SPOTLIGHT</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {heroTrack.title}
              </h2>
              <p className="text-zinc-300 font-medium text-base mt-1">
                {heroTrack.artist} • <span className="text-emerald-400">{heroTrack.album}</span>
              </p>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Experience the newest release in ultra high-definition lossless audio streaming.
              Analog modular synths woven with deep atmospheric percussion.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <button
                onClick={() => playTrack(heroTrack, tracks)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play Release</span>
              </button>
              <button
                onClick={() => toggleLike(heroTrack)}
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-sm font-semibold border border-zinc-700 transition"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked(heroTrack.id) ? 'text-rose-500 fill-rose-500' : ''
                  }`}
                />
                <span>{isLiked(heroTrack.id) ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 w-48 h-48 md:w-60 md:h-60 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 shrink-0 group">
            <img
              src={heroTrack.coverUrl}
              alt={heroTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      )}

      {/* Quick Play Shelf */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          Quick Play
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {playlists.slice(0, 6).map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist)}
              className="group flex items-center gap-3.5 p-2 pr-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/70 hover:border-zinc-700 cursor-pointer transition shadow-sm"
            >
              <img
                src={playlist.coverUrl}
                alt={playlist.title}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-300">
                  {playlist.title}
                </p>
                <p className="text-xs text-zinc-400 truncate">{playlist.trackCount} tracks</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (playlist.tracks.length > 0) {
                    playTrack(playlist.tracks[0], playlist.tracks);
                  }
                }}
                className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition shadow-lg shrink-0"
                title="Play playlist"
              >
                <Play className="w-4 h-4 fill-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Tracks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Trending Right Now
          </h2>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            Explore All
          </button>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
          {tracks.slice(0, 6).map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                className={`group flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/50 transition cursor-pointer ${
                  isCurrent ? 'bg-emerald-500/5' : ''
                }`}
                onClick={() => playTrack(track, tracks)}
              >
                {/* Index / Playing icon */}
                <span className="w-5 text-center text-xs font-mono text-zinc-500 group-hover:hidden">
                  {idx + 1}
                </span>
                <button
                  className="w-5 text-center hidden group-hover:flex items-center justify-center text-white"
                  title="Play"
                >
                  <Play className="w-4 h-4 fill-white" />
                </button>

                {/* Cover & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
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

                {/* Album */}
                <span className="hidden md:block text-xs text-zinc-400 truncate w-40">
                  {track.album}
                </span>

                {/* Plays */}
                <span className="hidden sm:block text-xs font-mono text-zinc-400 w-24 text-right">
                  {track.plays.toLocaleString()} plays
                </span>

                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track);
                  }}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-rose-500 transition"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isLiked(track.id) ? 'text-rose-500 fill-rose-500' : ''
                    }`}
                  />
                </button>

                {/* Duration */}
                <span className="text-xs font-mono text-zinc-500 w-12 text-right">
                  {Math.floor(track.duration / 60)}:
                  {(track.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Artists Shelf */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">Featured Artists</h2>
          <button
            onClick={() => onNavigate('artists')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {artists.slice(0, 5).map((artist) => (
            <div
              key={artist.id}
              onClick={() => onSelectArtist(artist)}
              className="group p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700/80 text-center cursor-pointer transition flex flex-col items-center"
            >
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-lg mb-3 group-hover:scale-105 transition duration-300">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm text-white truncate w-full group-hover:text-emerald-400">
                {artist.name}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {(artist.monthlyListeners / 1000000).toFixed(1)}M listeners
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
