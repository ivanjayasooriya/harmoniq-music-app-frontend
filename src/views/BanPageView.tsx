import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  LogOut,
  Mail,
  RotateCcw,
} from 'lucide-react';
import { HarmoniQLogo } from '../components/HarmoniQLogo';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const BanPageView: React.FC = () => {
  const { user, toggleBanStatus, logout } = useAuth();
  const [appealText, setAppealText] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealText.trim()) return;

    try {
      setIsSubmitting(true);
      await api.admin.submitBanAppeal({
        userId: user?.id || 'usr-1',
        username: user?.username || 'user',
        reason: appealText.trim(),
      });
      setAppealSubmitted(true);
    } catch (err) {
      console.error('Failed to submit appeal', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoRestore = async () => {
    await toggleBanStatus();
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-zinc-100">
      <div className="w-full max-w-xl bg-zinc-900/80 backdrop-blur-xl border border-rose-900/60 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
        <div className="flex justify-center">
          <HarmoniQLogo size="md" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-xl shadow-rose-950/40">
          <AlertOctagon className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wider uppercase">
            Account Restricted
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            HarmoniQ Access Suspended
          </h1>
          <p className="text-zinc-400 text-xs max-w-md mx-auto">
            Your account <span className="text-white font-semibold">@{user?.username || 'user'}</span> has
            been restricted from streaming and playlist publishing due to a security or terms violation.
          </p>
        </div>

        {/* Infraction Details */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-500 font-mono text-[10px]">
            <span>Reference: #HQ-BAN-{user?.id || '9921'}</span>
            <span>Date: {user?.bannedAt || 'Today'}</span>
          </div>
          <p className="text-zinc-200 font-medium">
            <span className="text-rose-400 font-semibold">Stated Violation:</span>{' '}
            {user?.banReason || 'Unusual stream botting or copyright policy infringement.'}
          </p>
        </div>

        {/* Appeal Form */}
        {appealSubmitted ? (
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="font-semibold text-sm">Appeal Request Submitted (BanAppealDTO)</p>
            <p className="text-zinc-400">
              The HarmoniQ trust & safety team has logged your appeal into the Spring Boot backend database.
              We will review your account activity and reply via email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitAppeal} className="space-y-3 text-left">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Submit Official Reinstatement Appeal
            </label>
            <textarea
              required
              rows={3}
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              placeholder="Explain why you believe this suspension was issued in error..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs transition border border-zinc-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting to Backend...' : 'Submit Appeal to Spring Boot'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Demo Restore & Logout */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={logout}
            className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out of HarmoniQ
          </button>

          <button
            onClick={handleDemoRestore}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Lift Ban (Demo Reversal)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
