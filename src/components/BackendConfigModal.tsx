import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import {
  api,
  getAuthToken,
  getStoredBackendUrl,
  isMockModeEnabled,
  setMockMode,
  setStoredBackendUrl,
} from '../services/api';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({ isOpen, onClose }) => {
  const [backendUrl, setBackendUrlState] = useState<string>(getStoredBackendUrl());
  const [useMock, setUseMockState] = useState<boolean>(isMockModeEnabled());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredBackendUrl(backendUrl.trim());
    setMockMode(useMock);
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setStoredBackendUrl(backendUrl.trim());
    const result = await api.checkBackendHealth();
    setTestResult(result);
    setTesting(false);
  };

  const currentToken = getAuthToken();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">HarmoniQ Spring Boot Configuration</h3>
              <p className="text-xs text-zinc-400">Targeting Spring Boot controllers with <code className="text-emerald-400 font-mono">/api/v1/*</code> routes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Base URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Spring Boot REST Base URL</span>
              <span className="text-[10px] text-zinc-500 font-mono">Port 8080</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrlState(e.target.value)}
                placeholder="http://localhost:8080/api/v1"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500 transition font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700 flex items-center gap-2 transition disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> : <RefreshCw className="w-4 h-4 text-emerald-400" />}
                Ping Health
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              Accepts either <code className="text-emerald-400 font-mono">http://localhost:8080/api/v1</code> or <code className="text-emerald-400 font-mono">http://localhost:8080</code>.
            </p>
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-3 text-sm ${
                testResult.ok
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                <span className="font-semibold">{testResult.ok ? 'Connection Verified:' : 'Ping Result:'}</span> {testResult.message}
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-white">Interactive Mock Mode</p>
              <p className="text-xs text-zinc-400">
                Fallback preview mode with audio synthesis if Spring Boot is offline
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => setUseMockState(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Active Spring Boot /api/v1/* Endpoints */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              HarmoniQ Backend Controllers
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-300 bg-zinc-950 p-3 rounded-2xl border border-zinc-800 max-h-36 overflow-y-auto">
              <span className="text-emerald-400">POST /api/v1/auth/signin</span>
              <span className="text-emerald-400">POST /api/v1/auth/signup</span>
              <span className="text-emerald-400">GET /api/v1/music/all</span>
              <span className="text-emerald-400">POST /api/v1/music/save</span>
              <span className="text-emerald-400">GET /api/v1/artist/all</span>
              <span className="text-emerald-400">POST /api/v1/artist/save</span>
              <span className="text-emerald-400">GET /api/v1/playlist/all</span>
              <span className="text-emerald-400">POST /api/v1/playlist/save</span>
              <span className="text-emerald-400">POST /api/v1/playlist-song/save</span>
              <span className="text-emerald-400">GET /api/v1/liked-song/all</span>
              <span className="text-emerald-400">GET /api/v1/genre/all</span>
              <span className="text-emerald-400">GET /api/v1/user/all</span>
              <span className="text-emerald-400">POST /api/v1/ban/save</span>
              <span className="text-emerald-400">POST /api/v1/chat</span>
            </div>
          </div>

          {/* Auth Token details */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>JWT Bearer Header:</span>
            </div>
            <span className="font-mono text-zinc-300 truncate max-w-[200px]">
              {currentToken ? `Bearer ${currentToken.slice(0, 18)}...` : 'Active Session Token'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
