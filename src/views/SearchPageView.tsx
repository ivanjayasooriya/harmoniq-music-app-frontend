import React, { useEffect, useState } from 'react';
import { Compass, Heart, Play, Search, Tag, Users, X } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { api } from '../services/api';
import { Artist, Genre, Playlist, Track } from '../types';

interface SearchPageViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectArtist: (artist: Artist) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const SearchPageView: React.FC<SearchPageViewProps> = ({
  searchQuery,
  setSearchQuery,
  onSelectArtist,
  onSelectPlaylist,
}) => {
  const { playTrack, isLiked, toggleLike, currentTrack } = useAudio();
  const [filterType, setFilterType] = useState<'all' | 'tracks' | 'artists' | 'playlists'>('all');
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const load = async () => {
      const [tracks, artists, playlists, gList] = await Promise.all([
        api.tracks.getAll(),
        api.artists.getAll(),
        api.playlists.getAll(),
        api.genres.getAll(),
      ]);
      setAllTracks(tracks);
      setAllArtists(artists);
      setAllPlaylists(playlists);
      setGenres(gList);
    };
    load();
  }, []);

  const q = searchQuery.toLowerCase().trim();

  const filteredTracks = q
    ? allTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q)
      )
    : [];

  const filteredArtists = q
    ? allArtists.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.genres.some((g) => g.toLowerCase().includes(q))
      )
    : [];

  const filteredPlaylists = q
    ? allPlaylists.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    : [];

  const hasQuery = q.length > 0;
  const topResult = filteredArtists[0] || filteredTracks[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Search Bar & Filters */}
      <div className="space-y-4">
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by song title, artist, album, or genre..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 pl-12 pr-12 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasQuery && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {(['all', 'tracks', 'artists', 'playlists'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full font-semibold capitalize transition ${
                  filterType === type
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Search Results */}
      {hasQuery ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Result & Tracks Grid */}
          {(filterType === 'all' || filterType === 'tracks') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Top Result Card */}
              {topResult && filterType === 'all' && (
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-base font-bold text-white tracking-tight">Top Result</h3>
                  {'avatarUrl' in topResult ? (
                    <div
                      onClick={() => onSelectArtist(topResult as Artist)}
                      className="p-6 rounded-3xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 transition cursor-pointer group flex flex-col justify-between h-64"
                    >
                      <img
                        src={(topResult as Artist).avatarUrl}
                        alt={(topResult as Artist).name}
                        className="w-24 h-24 rounded-full object-cover shadow-xl group-hover:scale-105 transition"
                      />
                      <div>
                        <h4 className="text-2xl font-extrabold text-white group-hover:text-emerald-400 transition">
                          {(topResult as Artist).name}
                        </h4>
                        <span className="inline-block mt-2 px-3 py-1 bg-zinc-800 rounded-full text-xs font-semibold text-zinc-300">
                          Artist
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => playTrack(topResult as Track, allTracks)}
                      className="p-6 rounded-3xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 transition cursor-pointer group flex flex-col justify-between h-64"
                    >
                      <img
                        src={(topResult as Track).coverUrl}
                        alt={(topResult as Track).title}
                        className="w-24 h-24 rounded-2xl object-cover shadow-xl group-hover:scale-105 transition"
                      />
                      <div>
                        <h4 className="text-2xl font-extrabold text-white group-hover:text-emerald-400 transition">
                          {(topResult as Track).title}
                        </h4>
                        <p className="text-zinc-400 text-sm mt-1">{(topResult as Track).artist}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400">
                          Song
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Matching Tracks */}
              <div className={`${topResult && filterType === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
                <h3 className="text-base font-bold text-white tracking-tight">Songs</h3>
                {filteredTracks.length === 0 ? (
                  <p className="text-sm text-zinc-500">No songs match your query.</p>
                ) : (
                  <div className="space-y-1">
                    {filteredTracks.slice(0, 5).map((track) => (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track, filteredTracks)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-900/90 border border-transparent hover:border-zinc-800 cursor-pointer transition ${
                          currentTrack?.id === track.id ? 'bg-emerald-500/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-semibold truncate ${
                                currentTrack?.id === track.id
                                  ? 'text-emerald-400'
                                  : 'text-zinc-200 group-hover:text-white'
                              }`}
                            >
                              {track.title}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
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
                          <span className="text-xs font-mono text-zinc-500">
                            {Math.floor(track.duration / 60)}:
                            {(track.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Matching Artists */}
          {(filterType === 'all' || filterType === 'artists') && filteredArtists.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Artists
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => onSelectArtist(artist)}
                    className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 text-center cursor-pointer transition flex flex-col items-center group"
                  >
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-20 h-20 rounded-full object-cover shadow-lg mb-3 group-hover:scale-105 transition"
                    />
                    <p className="text-sm font-semibold text-white truncate w-full group-hover:text-emerald-400">
                      {artist.name}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {(artist.monthlyListeners / 1000000).toFixed(1)}M listeners
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Playlists */}
          {(filterType === 'all' || filterType === 'playlists') && filteredPlaylists.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                Playlists
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => onSelectPlaylist(playlist)}
                    className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 cursor-pointer transition group"
                  >
                    <img
                      src={playlist.coverUrl}
                      alt={playlist.title}
                      className="w-full aspect-square rounded-xl object-cover mb-3 group-hover:scale-102 transition"
                    />
                    <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-400">
                      {playlist.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{playlist.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Browse All Genres & Moods */
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              Browse Genres & Categories
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Explore by style, vibe, and musical mood</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div
                key={genre.id}
                onClick={() => setSearchQuery(genre.name.split(' ')[0])}
                className={`group relative overflow-hidden rounded-2xl p-5 h-36 bg-gradient-to-br ${genre.color} cursor-pointer shadow-lg hover:scale-[1.02] transition-transform`}
              >
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    {genre.name}
                  </h3>
                  <p className="text-[11px] text-white/80 font-medium">
                    {genre.trackCount.toLocaleString()} tracks
                  </p>
                </div>
                {/* Decorative icon backdrop */}
                <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-black/15 rounded-full pointer-events-none transform rotate-12 group-hover:scale-125 transition duration-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
