import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { Track } from '../types';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  queueIndex: number;
  likedTrackIds: string[];
  isLiked: (trackId: string) => boolean;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleLike: (track: Track) => Promise<void>;
  // UI Panels
  showQueueDrawer: boolean;
  setShowQueueDrawer: (show: boolean) => void;
  showLyricsModal: boolean;
  setShowLyricsModal: (show: boolean) => void;
  showFullscreenPlayer: boolean;
  setShowFullscreenPlayer: (show: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);

  // Modals & Drawers
  const [showQueueDrawer, setShowQueueDrawer] = useState<boolean>(false);
  const [showLyricsModal, setShowLyricsModal] = useState<boolean>(false);
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState<boolean>(false);

  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevVolumeRef = useRef<number>(0.8);
  const synthTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load initial liked tracks & default track
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const liked = await api.tracks.getLikedTracks();
        setLikedTrackIds(liked.map((t) => t.id));

        const all = await api.tracks.getAll();
        if (all.length > 0) {
          setQueue(all);
          // Set initial default track without auto-playing
          setCurrentTrack(all[0]);
          setDuration(all[0].duration);
        }
      } catch (err) {
        console.error('Failed to load initial tracks', err);
      }
    };
    loadInitial();
  }, []);

  // Initialize HTML5 Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.round(audio.duration));
      } else if (currentTrack) {
        setDuration(currentTrack.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    const handleError = () => {
      // If external audio source fails or blocked, fallback to timer synthesis
      startSyntheticPlayback();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Harmonious Web Audio Synthesizer backup to guarantee music sound
  const playHarmonicChord = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [261.63, 329.63, 392.00, 523.25, 440.00]; // C E G C A chord
      const freq = notes[Math.floor(Math.random() * notes.length)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04 * (isMuted ? 0 : volume), ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch {
      // Ignore audio synthesis errors on older browsers
    }
  };

  // Synthetic interval when audio cannot play remote media
  const startSyntheticPlayback = () => {
    if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    synthTimerRef.current = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1;
        if (currentTrack && next >= currentTrack.duration) {
          handleNextTrack();
          return 0;
        }
        if (next % 4 === 0) {
          playHarmonicChord();
        }
        return next;
      });
    }, 1000);
  };

  const stopSyntheticPlayback = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  };

  // Play track
  const playTrack = (track: Track, newQueue?: Track[]) => {
    stopSyntheticPlayback();
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration);

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      const idx = queue.findIndex((t) => t.id === track.id);
      if (idx !== -1) {
        setQueueIndex(idx);
      } else {
        setQueue((prev) => [track, ...prev]);
        setQueueIndex(0);
      }
    }

    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Fallback gracefully
          setIsPlaying(true);
          startSyntheticPlayback();
          playHarmonicChord();
        });
    }
  };

  const togglePlay = () => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0]);
      }
      return;
    }

    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      stopSyntheticPlayback();
      setIsPlaying(false);
    } else {
      if (audioRef.current && audioRef.current.src) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            setIsPlaying(true);
            startSyntheticPlayback();
            playHarmonicChord();
          });
      } else {
        playTrack(currentTrack);
      }
    }
  };

  const handleNextTrack = () => {
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentTrack) {
      seek(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
      return;
    }

    let nextIndex = queueIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        stopSyntheticPlayback();
        return;
      }
    }

    const nextTrk = queue[nextIndex];
    if (nextTrk) {
      setQueueIndex(nextIndex);
      playTrack(nextTrk);
    }
  };

  const handlePrevTrack = () => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }
    const prevTrk = queue[prevIndex];
    if (prevTrk) {
      setQueueIndex(prevIndex);
      playTrack(prevTrk);
    }
  };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = seconds;
    }
  };

  const setVolume = (level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    setVolumeState(clamped);
    if (clamped > 0) setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = prevVolumeRef.current;
    } else {
      prevVolumeRef.current = volume;
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const cycleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
  };

  const isLiked = (trackId: string) => {
    return likedTrackIds.includes(trackId);
  };

  const toggleLike = async (track: Track) => {
    const res = await api.tracks.toggleLike(track.id);
    if (res.liked) {
      setLikedTrackIds((prev) => [...prev, track.id]);
    } else {
      setLikedTrackIds((prev) => prev.filter((id) => id !== track.id));
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration: duration || currentTrack?.duration || 180,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        likedTrackIds,
        isLiked,
        playTrack,
        togglePlay,
        nextTrack: handleNextTrack,
        prevTrack: handlePrevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleLike,
        showQueueDrawer,
        setShowQueueDrawer,
        showLyricsModal,
        setShowLyricsModal,
        showFullscreenPlayer,
        setShowFullscreenPlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
