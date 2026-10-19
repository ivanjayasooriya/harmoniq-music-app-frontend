import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Database,
  Disc,
  DollarSign,
  Headphones,
  Music,
  Plus,
  Radio,
  Server,
  ShieldAlert,
  Tag,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, ViewMode } from '../types';

interface AdminDashboardViewProps {
  onNavigate: (view: ViewMode) => void;
  onOpenBackendModal: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigate,
  onOpenBackendModal,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.admin.getStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  const maxPlays = Math.max(...stats.dailyPlays.map((d) => d.plays));

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Operations Live
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Studio & Operations Dashboard
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time platform analytics, streaming metrics, and backend telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBackendModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition"
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Spring Boot API</span>
          </button>

          <button
            onClick={() => onNavigate('music-management')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Music</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Listeners
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.totalUsers.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4% this month</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Streams
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {stats.activeStreams.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Concurrent streams online</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Audio Catalog
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Music className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.totalTracks.toLocaleString()}</p>
          <div className="text-xs text-zinc-400">
            Across {stats.totalArtists.toLocaleString()} registered artists
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Gross Royalties
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            ${stats.platformRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8.2% payout pool</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Stream Volume Bar Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Streaming Volume & Traffic</h3>
              <p className="text-xs text-zinc-400">Daily stream count over the past 7 days</p>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-zinc-800 rounded-full text-zinc-300">
              Last 7 Days
            </span>
          </div>

          {/* Custom SVG / Bar Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6">
            {stats.dailyPlays.map((day) => {
              const heightPercent = Math.round((day.plays / maxPlays) * 100);
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono text-emerald-400">
                    {(day.plays / 1000).toFixed(0)}k
                  </div>
                  <div
                    className="w-full bg-zinc-800 group-hover:bg-gradient-to-t group-hover:from-emerald-600 group-hover:to-teal-400 rounded-xl transition-all duration-300 relative overflow-hidden"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition">
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Genre Distribution */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-5">
          <div>
            <h3 className="font-bold text-base text-white">Genre Market Share</h3>
            <p className="text-xs text-zinc-400">Listenership by music genre</p>
          </div>

          {/* Progress bar stack */}
          <div className="w-full h-3 rounded-full overflow-hidden flex">
            {stats.genreBreakdown.map((item) => (
              <div
                key={item.genre}
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                title={`${item.genre}: ${item.percentage}%`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-3 pt-2">
            {stats.genreBreakdown.map((item) => (
              <div key={item.genre} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.genre}</span>
                </div>
                <span className="font-mono text-zinc-400">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Operations & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <h3 className="font-bold text-base text-white">Studio Management Modules</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('music-management')}
              className="p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/60 text-left transition space-y-2 group"
            >
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit group-hover:scale-105 transition">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Music Catalog</p>
                <p className="text-xs text-zinc-400">Upload & edit songs</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('artist-management')}
              className="p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/60 text-left transition space-y-2 group"
            >
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit group-hover:scale-105 transition">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Artist Roster</p>
                <p className="text-xs text-zinc-400">Verifications & profiles</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('user-management')}
              className="p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/60 text-left transition space-y-2 group"
            >
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-105 transition">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">User Accounts</p>
                <p className="text-xs text-zinc-400">Manage memberships & roles</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('banned-users')}
              className="p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/60 text-left transition space-y-2 group"
            >
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 w-fit group-hover:scale-105 transition">
                <UserX className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Banned Accounts</p>
                <p className="text-xs text-zinc-400">View infractions & appeals</p>
              </div>
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Recent Operations Audit</h3>
            <span className="text-xs text-zinc-500 font-mono">Live Log</span>
          </div>

          <div className="space-y-3">
            {stats.recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      act.type === 'ban'
                        ? 'bg-rose-500'
                        : act.type === 'upload'
                        ? 'bg-emerald-400'
                        : act.type === 'verify'
                        ? 'bg-amber-400'
                        : 'bg-indigo-400'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{act.description}</p>
                    {act.user && <p className="text-[10px] text-zinc-500">{act.user}</p>}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
