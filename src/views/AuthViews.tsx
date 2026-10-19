import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Radio,
  Shield,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole, ViewMode } from '../types';

interface AuthViewsProps {
  mode: 'sign-in' | 'sign-up' | 'forgot-password';
  onNavigate: (view: ViewMode) => void;
}

export const AuthViews: React.FC<AuthViewsProps> = ({ mode, onNavigate }) => {
  const { login, register } = useAuth();

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('USER');

  // Forgot Password / Email page state
  const [forgotEmail, setForgotEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'done'>('request');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sign In handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      await login(email, password);
      onNavigate('home');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid credentials. Please check your login details.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo fill
  const handleDemoSignIn = async (asAdmin: boolean) => {
    setErrorMsg('');
    try {
      setLoading(true);
      if (asAdmin) {
        await login('ivanjayasooriya03@gmail.com', 'admin123');
      } else {
        await login('sarah.k@example.com', 'user123');
      }
      onNavigate('home');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sign Up handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      await register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        role,
      });
      onNavigate('home');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password handler
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setLoading(true);
    await api.auth.forgotPassword(forgotEmail);
    setLoading(false);
    setStep('verify');
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim() || !newPassword.trim()) return;
    setLoading(true);
    await api.auth.resetPassword(verificationCode, newPassword);
    setLoading(false);
    setStep('done');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <Radio className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === 'sign-in' && 'Welcome to SoundWave'}
            {mode === 'sign-up' && 'Create Your Account'}
            {mode === 'forgot-password' && 'Password Recovery'}
          </h2>
          <p className="text-xs text-zinc-400">
            {mode === 'sign-in' && 'Stream lossless high-fidelity audio on any device'}
            {mode === 'sign-up' && 'Join millions of music lovers and independent artists'}
            {mode === 'forgot-password' && 'Enter your email to receive a verification reset code'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'sign-in' && (
          <div className="space-y-4">
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
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
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
                    onClick={() => onNavigate('forgot-password')}
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
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Sign In Options */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <p className="text-[11px] text-zinc-500 text-center font-semibold uppercase tracking-wider">
                Instant Demo Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn(true)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
                >
                  Sign in as Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn(false)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition"
                >
                  Sign in as User
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-500">Don't have an account? </span>
              <button
                onClick={() => onNavigate('sign-up')}
                className="text-xs text-emerald-400 font-semibold hover:underline"
              >
                Sign Up Free
              </button>
            </div>
          </div>
        )}

        {/* SIGN UP FORM */}
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
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
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Role Purpose
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="USER">Listener / Music Enthusiast</option>
                <option value="ARTIST">Artist / Music Producer</option>
                <option value="ADMIN">Studio Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-500">Already registered? </span>
              <button
                type="button"
                onClick={() => onNavigate('sign-in')}
                className="text-xs text-emerald-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD & EMAIL RECOVERY FLOW */}
        {mode === 'forgot-password' && (
          <div className="space-y-4">
            {step === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-3.5">
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
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Send Verification Code
                </button>
              </form>
            )}

            {step === 'verify' && (
              <form onSubmit={handleVerifyAndReset} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
                  A 6-digit confirmation code was dispatched to {forgotEmail}. Use demo code{' '}
                  <strong className="font-mono text-white">123456</strong>.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
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
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Set New Password
                </button>
              </form>
            )}

            {step === 'done' && (
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-base text-white">Password Updated!</h3>
                <p className="text-xs text-zinc-400">
                  Your credentials have been securely updated in the backend. You can now log in.
                </p>
                <button
                  onClick={() => onNavigate('sign-in')}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition"
                >
                  Return to Sign In
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onNavigate('sign-in')}
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
