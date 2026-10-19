import React from 'react';
import { Mic2, X } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export const LyricsModal: React.FC = () => {
  const { showLyricsModal, setShowLyricsModal, currentTrack } = useAudio();

  if (!showLyricsModal || !currentTrack) return null;

  const lines = currentTrack.lyrics
    ? currentTrack.lyrics.split('\n')
    : ['No lyrics available for this track yet. Enjoy the music!'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Ambient background glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none blur-3xl scale-125"
          style={{
            backgroundImage: `url(${currentTrack.coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{currentTrack.title}</h3>
              <p className="text-xs text-zinc-400">{currentTrack.artist} • {currentTrack.album}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLyricsModal(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lyrics body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-8 space-y-4 text-center select-text">
          {lines.map((line, idx) => {
            const isHeader = line.startsWith('[') && line.endsWith(']');
            const isEmpty = line.trim() === '';

            if (isEmpty) return <div key={idx} className="h-4" />;

            if (isHeader) {
              return (
                <p
                  key={idx}
                  className="text-xs font-mono font-bold tracking-widest text-emerald-400/80 uppercase pt-4"
                >
                  {line.replace(/[\[\]]/g, '')}
                </p>
              );
            }

            return (
              <p
                key={idx}
                className="text-lg md:text-xl font-medium text-zinc-300 hover:text-white transition-colors duration-150 leading-relaxed cursor-default"
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};
