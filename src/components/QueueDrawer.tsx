import React from 'react';
import { ListMusic, Play, Trash2, X } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export const QueueDrawer: React.FC = () => {
  const {
    showQueueDrawer,
    setShowQueueDrawer,
    queue,
    queueIndex,
    currentTrack,
    playTrack,
    removeFromQueue,
    clearQueue,
    isPlaying,
  } = useAudio();

  if (!showQueueDrawer) return null;

  const upcomingTracks = queue.slice(queueIndex + 1);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2.5 text-white">
          <ListMusic className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base">Play Queue</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
            {queue.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
              title="Clear queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowQueueDrawer(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Now Playing */}
        {currentTrack && (
          <div>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
              Now Playing
            </p>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-emerald-300 truncate">{currentTrack.artist}</p>
              </div>
              {isPlaying && (
                <div className="flex items-center gap-0.5 px-2">
                  <span className="w-1 bg-emerald-400 rounded-full animate-eq-1 inline-block"></span>
                  <span className="w-1 bg-emerald-400 rounded-full animate-eq-2 inline-block"></span>
                  <span className="w-1 bg-emerald-400 rounded-full animate-eq-3 inline-block"></span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Up Next */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Up Next ({upcomingTracks.length})
            </p>
          </div>

          {upcomingTracks.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No tracks left in queue. Add more from the library or home page!
            </div>
          ) : (
            <div className="space-y-1.5">
              {upcomingTracks.map((track, i) => {
                const actualIndex = queueIndex + 1 + i;
                return (
                  <div
                    key={`${track.id}-${actualIndex}`}
                    className="group flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
                  >
                    <div
                      onClick={() => playTrack(track, queue)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Play className="w-4 h-4 fill-white text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-white">
                          {track.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromQueue(actualIndex)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 transition"
                      title="Remove from queue"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
