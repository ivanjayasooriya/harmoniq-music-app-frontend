import React from 'react';

interface HarmoniQLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'admin';
  className?: string;
}

export const HarmoniQLogo: React.FC<HarmoniQLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 50, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 68, text: 'text-3xl', sub: 'text-sm' },
  };

  const { icon: px, text: textSize, sub: subSize } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Realistic Emblem: Soundwave 'Q' with Harmonic Waves */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-2xl p-1 bg-gradient-to-tr from-zinc-900 to-zinc-800 shadow-xl border border-zinc-700/60"
        style={{ width: px, height: px }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="hq-gradient-main" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            <linearGradient id="hq-ring" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <linearGradient id="hq-tail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>

            <filter id="hq-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Exterior Harmonic Sound Pulse Rings */}
          <circle
            cx="48"
            cy="48"
            r="38"
            stroke="url(#hq-ring)"
            strokeWidth="5"
            strokeDasharray="18 6 8 6 22 8"
            className="animate-spin"
            style={{ transformOrigin: '48px 48px', animationDuration: '24s' }}
          />

          {/* Inner Frequency Bar Waveform forming letter Q interior */}
          <rect x="28" y="40" width="4" height="16" rx="2" fill="url(#hq-gradient-main)" opacity="0.85" />
          <rect x="36" y="32" width="4" height="32" rx="2" fill="url(#hq-gradient-main)" />
          <rect x="44" y="24" width="4.5" height="48" rx="2.25" fill="#ffffff" filter="url(#hq-glow)" />
          <rect x="53" y="30" width="4" height="36" rx="2" fill="url(#hq-gradient-main)" />
          <rect x="61" y="38" width="4" height="20" rx="2" fill="url(#hq-gradient-main)" opacity="0.85" />

          {/* Central Vinyl Groove Accent */}
          <circle cx="48" cy="48" r="8" fill="#09090b" stroke="url(#hq-ring)" strokeWidth="2" />
          <circle cx="48" cy="48" r="3" fill="#10b981" />

          {/* Dynamic 'Q' Diagonal Sound Beam Tail */}
          <path
            d="M60 60 L84 84"
            stroke="url(#hq-tail)"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#hq-glow)"
          />
          <circle cx="84" cy="84" r="3" fill="#ffffff" />
        </svg>
      </div>

      {/* Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight text-white flex items-center ${textSize}`}>
            <span>Harmoni</span>
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent font-extrabold ml-0.5">
              Q
            </span>
            {variant === 'admin' && (
              <span className="ml-2 px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30 uppercase tracking-widest">
                Backstage
              </span>
            )}
          </div>
          <span className={`font-semibold tracking-wider text-zinc-400 uppercase mt-1 ${subSize}`}>
            {variant === 'admin' ? 'Administration & Studio' : 'High-Fidelity Audio'}
          </span>
        </div>
      )}
    </div>
  );
};
