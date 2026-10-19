import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Mail,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ViewMode } from '../types';

interface BanPageViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const BanPageView: React.FC<BanPageViewProps> = ({ onNavigate }) => {
  const { user, toggleBanStatus } = useAuth();
  const [appealText, setAppealText] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealText.trim()) return;
    setAppealSubmitted(true);
  };

  const handleDemoRestore = async () => {
    await toggleBanStatus();
    onNavigate('home');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-zinc-950/80 border border-rose-900/60 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-xl shadow-rose-950/40">
          <AlertOctagon className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wider uppercase">
            Account Restricted
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            SoundWave Access Suspended
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Your account <span className="text-white font-semibold">@{user?.username || 'user'}</span> has
            been restricted from streaming and playlist publishing due to a policy infraction.
          </p>
        </div>

        {/* Infraction Card */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-500 font-mono">
            <span>Reference Code: #SW-BAN-{user?.id || '9921'}</span>
            <span>Date: {user?.bannedAt || 'Today'}</span>
          </div>
          <p className="text-zinc-200 font-medium">
            <span className="text-rose-400 font-semibold">Stated Violation:</span>{' '}
            {user?.banReason || 'Unusual stream botting or copyright violation.'}
          </p>
        </div>

        {/* Appeal Form */}
        {appealSubmitted ? (
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="font-semibold text-sm">Appeal Request Under Review</p>
            <p className="text-zinc-400">
              Our safety review team will audit your activity against the Spring Boot backend
              database logs and reply within 24-48 business hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitAppeal} className="space-y-3 text-left">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Submit Reinstatement Appeal
            </label>
            <textarea
              required
              rows={3}
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              placeholder="Explain why you believe this suspension was issued in error..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs transition border border-zinc-700 flex items-center justify-center gap-2"
            >
              <span>Submit Appeal for Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Demo Restore Access Button */}
        <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="mailto:support@soundwave.io"
            className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            Contact Trust & Safety
          </a>

          <button
            onClick={handleDemoRestore}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Lift Ban (Interactive Demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
