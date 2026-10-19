import React, { useEffect, useState } from 'react';
import { BadgeCheck, Compass, Search, UserPlus, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { Artist } from '../types';

interface ArtistsViewProps {
  onSelectArtist: (artist: Artist) => void;
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({ onSelectArtist }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const data = await api.artists.getAll();
        setArtists(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const handleToggleFollow = async (artist: Artist, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await api.artists.toggleFollow(artist.id);
    setArtists((prev) =>
      prev.map((a) =>
        a.id === artist.id
          ? {
              ...a,
              followed: res.followed,
              monthlyListeners: a.monthlyListeners + (res.followed ? 1 : -1),
            }
          : a
      )
    );
  };

  const filtered = filterQuery.trim()
    ? artists.filter(
        (a) =>
          a.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
          a.genres.some((g) => g.toLowerCase().includes(filterQuery.toLowerCase()))
      )
    : artists;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Compass className="w-7 h-7 text-emerald-400" />
            Discover Artists
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Follow producers, songwriters, and bands from around the world
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search artists..."
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((artist) => (
          <div
            key={artist.id}
            onClick={() => onSelectArtist(artist)}
            className="group p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700/80 cursor-pointer transition flex flex-col items-center text-center justify-between"
          >
            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-xl mb-4 group-hover:scale-105 transition duration-300">
              <img
                src={artist.avatarUrl}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1 w-full min-w-0">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="font-bold text-base text-white truncate group-hover:text-emerald-400">
                  {artist.name}
                </h3>
                {artist.verified && (
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                {(artist.monthlyListeners / 1000000).toFixed(1)}M monthly listeners
              </p>
              <div className="flex flex-wrap justify-center gap-1 pt-1">
                {artist.genres.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 w-full">
              <button
                onClick={(e) => handleToggleFollow(artist, e)}
                className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  artist.followed
                    ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-100 hover:bg-white text-black'
                }`}
              >
                {artist.followed ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Follow
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
