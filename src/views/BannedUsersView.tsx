import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Search,
  ShieldAlert,
  UserX,
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

export const BannedUsersView: React.FC = () => {
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchBanned = async () => {
    const list = await api.admin.getBannedUsers();
    setBannedUsers(list);
  };

  useEffect(() => {
    fetchBanned();
  }, []);

  const handleUnban = async (user: User) => {
    const updated = await api.admin.unbanUser(user.id);
    setBannedUsers((prev) => prev.filter((u) => u.id !== updated.id));
    setToastMsg(`Access restored for ${updated.fullName} (@${updated.username})`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = bannedUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.banReason && u.banReason.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <UserX className="w-7 h-7 text-rose-500" />
            Restricted & Banned Accounts
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review security infractions, appeals, and access revocations
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold">
          {bannedUsers.length} Banned Account{bannedUsers.length === 1 ? '' : 's'}
        </span>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search banned accounts or infractions..."
          className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 transition"
        />
      </div>

      {/* Banned Users Cards */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Suspended Accounts</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            All users currently comply with platform policies. Any accounts banned by administrators
            will appear here for appeal processing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-rose-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-rose-700/50 grayscale"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
                    <span className="text-xs text-zinc-400">@{user.username}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">
                      SUSPENDED
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 mt-2 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">Infraction Reason:</span>{' '}
                      {user.banReason || 'Terms of Service violation'}
                      {user.bannedAt && (
                        <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">
                          Date applied: {user.bannedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => handleUnban(user)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Lift Ban & Restore</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
