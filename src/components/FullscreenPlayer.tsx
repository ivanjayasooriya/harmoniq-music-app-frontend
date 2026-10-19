import React from 'react';
import {
  ChevronDown,
  Heart,
  ListMusic,
  Mic2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const FullscreenPlayer: React.FC = () => {
  const {
    showFullscreenPlayer,
    setShowFullscreenPlayer,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isLiked,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
    setShowLyricsModal,
    setShowQueueDrawer,
  } = useAudio();

  if (!showFullscreenPlayer || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-between p-6 md:p-12 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Background ambient radial gradients */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none blur-3xl scale-150"
        style={{
          backgroundImage: `url(${currentTrack.coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={() => setShowFullscreenPlayer(false)}
          className="p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          title="Minimize player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-[11px] uppercase tracking-widest text-emerald-400 font-mono font-bold">
            Playing From Playlist
          </p>
          <h2 className="text-sm font-semibold text-zinc-200 truncate max-w-xs md:max-w-md">
            {currentTrack.album}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowFullscreenPlayer(false);
              setShowLyricsModal(true);
            }}
            className="p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white transition"
            title="View lyrics"
          >
            <Mic2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setShowFullscreenPlayer(false);
              setShowQueueDrawer(true);
            }}
            className="p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white transition"
            title="View queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Showcase: Artwork with Equalizer Pulse */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6">
        <div className="relative group max-w-[340px] md:max-w-[420px] aspect-square w-full">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className={`w-full h-full rounded-3xl object-cover shadow-2xl border border-zinc-700/50 transition-all duration-700 ${
              isPlaying ? 'scale-100 shadow-emerald-500/20' : 'scale-95 opacity-80'
            }`}
          />
        </div>

        {/* Track Title & Artist */}
        <div className="mt-8 text-center max-w-lg px-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate">
              {currentTrack.title}
            </h1>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-2 text-zinc-400 hover:text-rose-500 transition"
            >
              <Heart
                className={`w-6 h-6 ${
                  liked ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-400'
                }`}
              />
            </button>
          </div>
          <p className="text-base text-zinc-400 mt-1 font-medium">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-4 pb-4">
        {/* Scrubber */}
        <div className="space-y-1">
          <div className="relative flex items-center group py-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={1}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-1.5 group-hover:h-2.5 bg-zinc-800 rounded-full overflow-hidden transition-all duration-150">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={toggleShuffle}
            className={`p-3 rounded-full transition ${
              isShuffle ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-6 h-6" />
          </button>

          <button
            onClick={prevTrack}
            className="p-3 text-zinc-200 hover:text-white transition active:scale-90"
          >
            <SkipBack className="w-8 h-8 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-1" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-3 text-zinc-200 hover:text-white transition active:scale-90"
          >
            <SkipForward className="w-8 h-8 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-3 rounded-full transition ${
              repeatMode !== 'off' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
          </button>
        </div>

        {/* Bottom Volume */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <div className="w-48">
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
