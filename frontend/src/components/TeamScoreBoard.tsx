import type { ReactNode } from 'react';
import { Trophy, Trash2 } from 'lucide-react';
import type { TeamStats, ProgressStats } from '../types';

interface Props {
  tournamentName: string;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  teamStats: TeamStats | undefined;
  progress: ProgressStats;
  isFinished: boolean;
  canDelete: boolean;
  onDelete: () => void;
  /** Tab bar (Schedule / Stats) rendered inside the same card */
  children?: ReactNode;
}

export default function TeamScoreBoard({
  tournamentName, teamAName, teamBName, teamAColor, teamBColor, teamStats, progress, isFinished, canDelete, onDelete, children,
}: Props) {
  const aPoints = teamStats?.teamA.points ?? 0;
  const bPoints = teamStats?.teamB.points ?? 0;
  const total = aPoints + bPoints;
  const aPct = total > 0 ? Math.round((aPoints / total) * 100) : 50;
  const bPct = 100 - aPct;
  const aLeading = aPoints > bPoints;
  const bLeading = bPoints > aPoints;

  return (
    <div className="rounded-2xl shadow-xl overflow-hidden mb-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f1a2e 100%)' }}>

      {/* ── Header: tournament name + finished + delete ─────────────────── */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-amber-500/20"
        style={{ background: 'rgba(212,175,55,0.10)' }}>
        <Trophy size={14} className="text-amber-400 shrink-0" />
        <span className="font-black text-sm text-amber-300 truncate">{tournamentName}</span>
        {isFinished && (
          <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,215,0,0.18)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.45)' }}>
            🏆 Finished
          </span>
        )}
        {canDelete && (
          <button
            onClick={onDelete}
            title="Delete this entire tournament"
            className="bs-no-print ml-auto shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border border-red-800/30 text-red-400/50 hover:text-red-300 hover:border-red-600/50 hover:bg-red-900/15 transition-colors"
          >
            <Trash2 size={11} /> <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>

      {/* ── Main score row ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 gap-2">
        {/* Team A */}
        <div className={`flex-1 text-center transition-transform duration-300 ${aLeading ? 'scale-105' : ''}`}>
          <div className="bs-display text-sm font-bold uppercase tracking-wider mb-1.5 truncate" style={{ color: teamAColor }}>{teamAName}</div>
          <div className={`bs-numeric leading-none tabular-nums ${aLeading ? 'text-white' : 'text-slate-400'}`}
            style={{ fontSize: 'clamp(2rem, 11vw, 3.75rem)', textShadow: aLeading ? `0 0 22px ${teamAColor}80` : 'none' }}>
            {aPoints}
          </div>
          <div className="text-slate-300 text-xs mt-1.5 space-x-1">
            <span className="text-green-400">{teamStats?.teamA.wins ?? 0}W</span>
            <span>·</span>
            <span className="text-slate-400">{teamStats?.teamA.draws ?? 0}D</span>
            <span>·</span>
            <span className="text-red-400">{teamStats?.teamA.losses ?? 0}L</span>
          </div>
        </div>

        {/* VS centre */}
        <div className="px-2 sm:px-3 text-center flex-shrink-0">
          <div className="bs-display text-slate-400 font-bold text-xl sm:text-2xl">VS</div>
          {aLeading && <div className="text-xs mt-1 font-black" style={{ color: teamAColor }}>Leading ↑</div>}
          {bLeading && <div className="text-xs mt-1 font-black" style={{ color: teamBColor }}>Leading ↑</div>}
          {!aLeading && !bLeading && aPoints > 0 &&
            <div className="text-amber-400 text-xs mt-1 font-semibold">Tied</div>}
        </div>

        {/* Team B */}
        <div className={`flex-1 text-center transition-transform duration-300 ${bLeading ? 'scale-105' : ''}`}>
          <div className="bs-display text-sm font-bold uppercase tracking-wider mb-1.5 truncate" style={{ color: teamBColor }}>{teamBName}</div>
          <div className={`bs-numeric leading-none tabular-nums ${bLeading ? 'text-white' : 'text-slate-400'}`}
            style={{ fontSize: 'clamp(2rem, 11vw, 3.75rem)', textShadow: bLeading ? `0 0 22px ${teamBColor}80` : 'none' }}>
            {bPoints}
          </div>
          <div className="text-slate-300 text-xs mt-1.5 space-x-1">
            <span className="text-green-400">{teamStats?.teamB.wins ?? 0}W</span>
            <span>·</span>
            <span className="text-slate-400">{teamStats?.teamB.draws ?? 0}D</span>
            <span>·</span>
            <span className="text-red-400">{teamStats?.teamB.losses ?? 0}L</span>
          </div>
        </div>
      </div>

      {/* ── Points-share bar (team points split — not a completion bar) ──── */}
      <div className="px-3 sm:px-5 pb-3">
        <div className="flex rounded-full overflow-hidden h-2 bg-slate-700 mb-1">
          <div className="transition-all duration-700 ease-out" style={{ width: `${aPct}%`, background: `linear-gradient(90deg, ${teamAColor}AA, ${teamAColor})` }} />
          <div className="transition-all duration-700 ease-out" style={{ width: `${bPct}%`, background: `linear-gradient(90deg, ${teamBColor}AA, ${teamBColor})` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-black" style={{ color: teamAColor }}>{aPct}%</span>
          <span className="text-slate-400">{progress.completed} / {progress.total} played</span>
          <span className="font-black" style={{ color: teamBColor }}>{bPct}%</span>
        </div>
      </div>

      {/* ── Tabs (Schedule / Stats) — same card ─────────────────────────── */}
      {children && (
        <div className="flex border-t border-amber-900/30 px-2">
          {children}
        </div>
      )}
    </div>
  );
}
