import React, { useState } from 'react';
import {
  Heart,
  ListMusic,
  Maximize2,
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

export const PlayerBar: React.FC = () => {
  const {
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
    showQueueDrawer,
    setShowQueueDrawer,
    showLyricsModal,
    setShowLyricsModal,
    setShowFullscreenPlayer,
  } = useAudio();

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  if (!currentTrack) {
    return null;
  }

  const liked = isLiked(currentTrack.id);
  const displayTime = isScrubbing ? scrubValue : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrubValue(parseFloat(e.target.value));
  };

  const handleSeekStart = () => {
    setIsScrubbing(true);
  };

  const handleSeekEnd = () => {
    setIsScrubbing(false);
    seek(scrubValue);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-22 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 md:px-6 flex items-center justify-between gap-2 md:gap-6 shadow-2xl">
      {/* Left: Track Details */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[180px] max-w-[320px]">
        <div className="relative group shrink-0">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className={`w-14 h-14 rounded-xl object-cover shadow-md transition-transform duration-300 ${
              isPlaying ? 'scale-100 shadow-emerald-500/10' : 'opacity-90'
            }`}
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center gap-0.5 pointer-events-none">
              <span className="w-1 bg-emerald-400 rounded-full animate-eq-1 inline-block"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-eq-2 inline-block"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-eq-3 inline-block"></span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
              {currentTrack.title}
            </h4>
            {currentTrack.explicit && (
              <span className="text-[9px] font-bold px-1 bg-zinc-700 text-zinc-300 rounded shrink-0">
                E
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 truncate hover:text-zinc-200 cursor-pointer">
            {currentTrack.artist}
          </p>
        </div>

        <button
          onClick={() => toggleLike(currentTrack)}
          className="p-1.5 rounded-full text-zinc-400 hover:text-white transition shrink-0"
          title={liked ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart
            className={`w-5 h-5 transition-transform active:scale-125 ${
              liked ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-400'
            }`}
          />
        </button>
      </div>

      {/* Center: Playback Controls & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 flex-1 max-w-2xl px-2">
        {/* Buttons */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`relative p-2 rounded-full transition ${
              isShuffle ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
            }`}
            title={`Shuffle ${isShuffle ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Previous */}
          <button
            onClick={prevTrack}
            className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition active:scale-95"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause button */}
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition-all duration-200 shadow-lg shadow-white/10 hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition active:scale-95"
            title="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            className={`relative p-2 rounded-full transition ${
              repeatMode !== 'off' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            {repeatMode !== 'off' && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Progress Bar & Timers */}
        <div className="w-full flex items-center gap-3 text-xs font-mono text-zinc-400 select-none">
          <span className="w-10 text-right">{formatTime(displayTime)}</span>
          <div className="relative flex-1 group flex items-center py-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={1}
              value={displayTime}
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-1 group-hover:h-2 bg-zinc-800 rounded-full overflow-hidden transition-all duration-150">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="w-10 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Audio Utilities */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/4 min-w-[150px] max-w-[280px]">
        {/* Lyrics Toggle */}
        <button
          onClick={() => setShowLyricsModal(!showLyricsModal)}
          className={`p-2 rounded-xl transition ${
            showLyricsModal
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
          title="Synced Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue Toggle */}
        <button
          onClick={() => setShowQueueDrawer(!showQueueDrawer)}
          className={`p-2 rounded-xl transition ${
            showQueueDrawer
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
          title="Play Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Controls */}
        <div className="hidden md:flex items-center gap-2 group">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div className="relative w-20 flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Fullscreen Player Modal */}
        <button
          onClick={() => setShowFullscreenPlayer(true)}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition hidden sm:flex"
          title="Expanded Player View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
