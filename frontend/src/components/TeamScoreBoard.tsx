import type { TeamStats, ProgressStats } from '../types';

interface Props {
  teamAName: string;
  teamBName: string;
  teamStats: TeamStats | undefined;
  progress: ProgressStats;
}

export default function TeamScoreBoard({ teamAName, teamBName, teamStats, progress }: Props) {
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
      {/* Header bar */}
      <div className="flex items-center justify-center gap-2 py-2 border-b border-amber-500/20"
        style={{ background: 'rgba(212,175,55,0.12)' }}>
        <span className="text-amber-400 text-xs font-black tracking-widest uppercase">★ BADMINTON STARS ★ Live Scoreboard</span>
        <span className="text-amber-300/50 text-xs">·</span>
        <span className="text-amber-300/70 text-xs">20 pts / match win &nbsp;|&nbsp; 10 pts / player</span>
      </div>

      {/* Main score row */}
      <div className="flex items-center justify-between px-6 py-5 gap-2">
        {/* Team A */}
        <div className={`flex-1 text-center transition-transform duration-300 ${aLeading ? 'scale-105' : ''}`}>
          <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#4DD4C8' }}>{teamAName}</div>
          <div className={`font-black leading-none tabular-nums ${aLeading ? 'text-white' : 'text-slate-500'}`}
            style={{ fontSize: '3.5rem' }}>
            {aPoints}
          </div>
          <div className="text-slate-500 text-xs mt-2 space-x-1">
            <span className="text-green-400">{teamStats?.teamA.wins ?? 0}W</span>
            <span>·</span>
            <span className="text-slate-400">{teamStats?.teamA.draws ?? 0}D</span>
            <span>·</span>
            <span className="text-red-400">{teamStats?.teamA.losses ?? 0}L</span>
          </div>
        </div>

        {/* VS centre */}
        <div className="px-3 text-center flex-shrink-0">
          <div className="text-slate-600 font-black text-2xl">VS</div>
          {aLeading && <div className="text-xs mt-1 font-black" style={{ color: '#4DD4C8' }}>Leading ↑</div>}
          {bLeading && <div className="text-xs mt-1 font-black" style={{ color: '#FF7070' }}>Leading ↑</div>}
          {!aLeading && !bLeading && aPoints > 0 &&
            <div className="text-amber-400 text-xs mt-1 font-semibold">Tied</div>}
        </div>

        {/* Team B */}
        <div className={`flex-1 text-center transition-transform duration-300 ${bLeading ? 'scale-105' : ''}`}>
          <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#FF7070' }}>{teamBName}</div>
          <div className={`font-black leading-none tabular-nums ${bLeading ? 'text-white' : 'text-slate-500'}`}
            style={{ fontSize: '3.5rem' }}>
            {bPoints}
          </div>
          <div className="text-slate-500 text-xs mt-2 space-x-1">
            <span className="text-green-400">{teamStats?.teamB.wins ?? 0}W</span>
            <span>·</span>
            <span className="text-slate-400">{teamStats?.teamB.draws ?? 0}D</span>
            <span>·</span>
            <span className="text-red-400">{teamStats?.teamB.losses ?? 0}L</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-4">
        <div className="flex rounded-full overflow-hidden h-2.5 bg-slate-700 mb-1.5">
          <div className="transition-all duration-700 ease-out" style={{ width: `${aPct}%`, background: 'linear-gradient(90deg,#0D7C7C,#1AA8A8)' }} />
          <div className="transition-all duration-700 ease-out" style={{ width: `${bPct}%`, background: 'linear-gradient(90deg,#8B1A1A,#C42020)' }} />
          <div
            className="bg-orange-500 transition-all duration-700 ease-out"
            style={{ width: `${bPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-blue-400 font-semibold">{aPct}%</span>
          <span className="text-slate-500">
            {progress.completed} / {progress.total} matches played
          </span>
            <span className="font-black" style={{ color: '#F87171' }}>{bPct}%</span>
        </div>
      </div>
    </div>
  );
}
