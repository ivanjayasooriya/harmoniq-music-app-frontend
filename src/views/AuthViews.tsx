import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Headphones,
  KeyRound,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { HarmoniQLogo } from '../components/HarmoniQLogo';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AuthMode, UserRole } from '../types';

interface AuthViewsProps {
  mode: AuthMode;
  onSwitchMode: (mode: AuthMode) => void;
}

export const AuthViews: React.FC<AuthViewsProps> = ({ mode, onSwitchMode }) => {
  const { login, register } = useAuth();

  // Login target portal choice: Listener vs Admin
  const [targetPortal, setTargetPortal] = useState<'user' | 'admin'>('user');

  // Sign In credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up credentials
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('USER');

  // Forgot password flow
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpStep, setOtpStep] = useState<'send' | 'verify' | 'done'>('send');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      await login(email, password, targetPortal);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid credentials. Please verify your login details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (isAdmin: boolean) => {
    setErrorMsg('');
    try {
      setLoading(true);
      if (isAdmin) {
        await login('ivanjayasooriya03@gmail.com', 'admin123', 'admin');
      } else {
        await login('sarah.k@example.com', 'user123', 'user');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      await register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        role: signUpRole,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setLoading(true);
    await api.auth.sendOtp(forgotEmail);
    setLoading(false);
    setOtpStep('verify');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !newPassword.trim()) return;
    setLoading(true);
    await api.auth.resetPassword(otpCode, newPassword);
    setLoading(false);
    setOtpStep('done');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 animate-in zoom-in-95 duration-200">
        {/* Brand Logo */}
        <div className="text-center flex flex-col items-center space-y-3">
          <HarmoniQLogo size="lg" />
          <p className="text-xs text-zinc-400 max-w-xs">
            {mode === 'sign-in' && 'Choose your portal and sign in to continue'}
            {mode === 'sign-up' && 'Create your account for master audio streaming'}
            {mode === 'forgot-password' && 'Password recovery with OTP verification'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* SIGN IN */}
        {mode === 'sign-in' && (
          <div className="space-y-4">
            {/* PORTAL SEPARATION TABS */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                onClick={() => setTargetPortal('user')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition ${
                  targetPortal === 'user'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Listener App</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetPortal('admin')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition ${
                  targetPortal === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Backstage</span>
              </button>
            </div>

            <div className="text-[11px] text-zinc-400 text-center font-mono">
              {targetPortal === 'user'
                ? 'Streaming player, playlists, and personal favorites'
                : 'Catalog uploads, artist roster, bans, and system metrics'}
            </div>

            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => onSwitchMode('forgot-password')}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition shadow-lg active:scale-95 disabled:opacity-50 ${
                  targetPortal === 'admin'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                }`}
              >
                {loading
                  ? 'Connecting to Spring Boot...'
                  : targetPortal === 'admin'
                  ? 'Sign In to Admin Portal'
                  : 'Sign In as Listener'}
              </button>
            </form>

            {/* Quick 1-click Demo Fillers */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <p className="text-[10px] text-zinc-500 text-center font-semibold uppercase tracking-wider">
                Instant One-Click Login
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo(false)}
                  className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Demo Listener</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo(true)}
                  className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-indigo-300 border border-indigo-900/60 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Demo Admin</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-500">Need an account? </span>
              <button
                onClick={() => onSwitchMode('sign-up')}
                className="text-xs text-emerald-400 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* SIGN UP */}
        {mode === 'sign-up' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ivan Jayasooriya"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Username / Handle *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ivanj"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Account Purpose
              </label>
              <select
                value={signUpRole}
                onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="USER">Music Listener (Listener App)</option>
                <option value="ADMIN">Studio Administrator (Admin Portal)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating Account in Spring Boot...' : 'Create Account'}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-500">Already have an account? </span>
              <button
                type="button"
                onClick={() => onSwitchMode('sign-in')}
                className="text-xs text-emerald-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot-password' && (
          <div className="space-y-4">
            {otpStep === 'send' && (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  {loading ? 'Dispatching OTP...' : 'Send Verification OTP'}
                </button>
              </form>
            )}

            {otpStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
                  An OTP verification code was sent to {forgotEmail}. Use demo code{' '}
                  <strong className="font-mono text-white">123456</strong>.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    New Secure Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Reset & Save Password
                </button>
              </form>
            )}

            {otpStep === 'done' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-base text-white">Password Updated</h3>
                <p className="text-xs text-zinc-400">
                  Your credentials have been securely updated. You can now sign in.
                </p>
                <button
                  onClick={() => onSwitchMode('sign-in')}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition"
                >
                  Return to Sign In
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onSwitchMode('sign-in')}
                className="text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
