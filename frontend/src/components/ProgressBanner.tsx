import type { ProgressStats } from '../types';
import { CheckCircle, Clock, XCircle, Trophy } from 'lucide-react';

interface Props { progress: ProgressStats; teamAName: string; teamBName: string; matchesPerPlayer: string; }

export default function ProgressBanner({ progress, teamAName, teamBName, matchesPerPlayer }: Props) {
  const { total, completed, pending, notPlayed, pct, isFinished } = progress;

  return (
    <div className="mb-4">
      {isFinished && (
        <div className="flex items-center gap-2 mb-2 text-amber-600 font-bold text-sm">
          <Trophy size={18} className="text-amber-500" /> 🏆 Tournament Finished — Results Locked
        </div>
      )}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm mb-2">
        <span className="font-black text-gray-900 tracking-wide">
          <span style={{ color: '#1AA8A8' }}>{teamAName}</span>
          <span className="text-gray-400 mx-1">vs</span>
          <span style={{ color: '#C42020' }}>{teamBName}</span>
        </span>
        <span className="flex items-center gap-1 text-green-700 font-semibold">
          <CheckCircle size={13} className="text-green-500" />{completed} Done
        </span>
        <span className="flex items-center gap-1 text-amber-600 font-semibold">
          <Clock size={13} className="text-amber-500" />{pending} Pending
        </span>
        {notPlayed > 0 && <span className="flex items-center gap-1 text-gray-400">
          <XCircle size={13} />{notPlayed} N/P
        </span>}
        <span className="text-gray-400 text-xs">Total: {total} · Per Player: {matchesPerPlayer}</span>
      </div>
      <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: '#e5e7eb' }}>
        <div className="h-3 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg, #15803d, #22c55e)'
              : 'linear-gradient(90deg, #8B6914, #D4AF37 50%, #F5D55A)',
          }} />
      </div>
      <p className="text-xs text-gray-500 mt-1 font-semibold">{pct}% complete</p>
    </div>
  );
}
