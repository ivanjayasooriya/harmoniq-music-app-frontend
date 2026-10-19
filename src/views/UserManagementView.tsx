import React, { useEffect, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole } from '../types';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [banningUser, setBanningUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('Repeated copyright infringement and violation of Terms of Service.');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchUsers = async () => {
    const list = await api.admin.getUsers();
    setUsers(list);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    const updated = await api.admin.updateUserRole(userId, role);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showToast(`Role updated to ${role}`);
  };

  const handleConfirmBan = async () => {
    if (!banningUser) return;
    const updated = await api.admin.banUser(banningUser.id, banReason);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setBanningUser(null);
    showToast(`Account @${updated.username} has been suspended.`);
  };

  const handleUnban = async (user: User) => {
    const updated = await api.admin.unbanUser(user.id);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showToast(`Access restored for @${updated.username}.`);
  };

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-400" />
            User Account Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Audit user roles, subscriptions, and platform access restrictions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            Total Accounts: {users.length}
          </span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {feedbackMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or @handle..."
          className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
        <div className="divide-y divide-zinc-800/50">
          <div className="flex items-center gap-4 px-4 py-2.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider select-none bg-zinc-950/40">
            <span className="flex-1">User</span>
            <span className="hidden md:block w-32">Plan</span>
            <span className="w-32">Role</span>
            <span className="hidden sm:block w-28 text-center">Status</span>
            <span className="w-28 text-right">Actions</span>
          </div>

          {filtered.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/40 transition group"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                  <p className="text-xs text-zinc-400 truncate">@{user.username} • {user.email}</p>
                </div>
              </div>

              <div className="hidden md:block w-32 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {user.plan}
                </span>
              </div>

              <div className="w-32">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                  className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
                >
                  <option value="USER">USER</option>
                  <option value="ARTIST">ARTIST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="hidden sm:block w-28 text-center">
                {user.isBanned ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    BANNED
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-1.5 w-28">
                {user.isBanned ? (
                  <button
                    onClick={() => handleUnban(user)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 transition"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => setBanningUser(user)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Ban
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ban User Modal */}
      {banningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-rose-900/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <ShieldAlert className="w-5 h-5" />
                Suspend Account: @{banningUser.username}
              </div>
              <button
                onClick={() => setBanningUser(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Suspending this account will revoke their ability to stream tracks, create playlists,
              and participate in community discussions. They will see the Account Suspended notice.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Violation Reason
              </label>
              <textarea
                rows={3}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for suspension..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setBanningUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBan}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-600/30"
              >
                Confirm Account Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
