import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Server, ShieldCheck, Database, X } from 'lucide-react';
import { api, getStoredBackendUrl, setStoredBackendUrl, isMockModeEnabled, setMockMode, getAuthToken } from '../services/api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Spring Boot Backend Config</h3>
              <p className="text-xs text-zinc-400">Configure connection to your Spring Boot REST server</p>
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
          {/* Server URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Spring Boot Base API URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrlState(e.target.value)}
                placeholder="http://localhost:8080/api"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-sm font-medium border border-zinc-700 flex items-center gap-2 transition disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> : <RefreshCw className="w-4 h-4 text-emerald-400" />}
                Ping
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Default is usually <code className="text-emerald-400 font-mono">http://localhost:8080/api</code>
            </p>
          </div>

          {/* Connection Test Result */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-sm ${
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
                <span className="font-semibold">{testResult.ok ? 'Connected:' : 'Notice:'}</span> {testResult.message}
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-white">Interactive Mock Mode</p>
                <p className="text-xs text-zinc-400">
                  Enable rich in-memory sample catalog with audio previews if your Spring Boot is offline
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
          </div>

          {/* Endpoints Reference */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Supported Spring Boot REST Routes
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 max-h-32 overflow-y-auto">
              <span className="text-emerald-400">GET /api/tracks</span>
              <span className="text-emerald-400">POST /api/tracks</span>
              <span className="text-emerald-400">GET /api/playlists</span>
              <span className="text-emerald-400">POST /api/playlists</span>
              <span className="text-emerald-400">GET /api/artists</span>
              <span className="text-emerald-400">GET /api/genres</span>
              <span className="text-emerald-400">POST /api/auth/login</span>
              <span className="text-emerald-400">GET /api/admin/stats</span>
            </div>
          </div>

          {/* Auth Token details */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>JWT Bearer Header:</span>
            </div>
            <span className="font-mono text-zinc-300 truncate max-w-[200px]">
              {currentToken ? `Bearer ${currentToken.slice(0, 16)}...` : 'Active Session Token'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition shadow-lg shadow-emerald-500/20"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
