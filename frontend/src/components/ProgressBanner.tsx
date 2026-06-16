import type { ProgressStats } from '../types';
import { CheckCircle, Clock, XCircle, Trophy } from 'lucide-react';

interface Props { progress: ProgressStats; teamAName: string; teamBName: string; matchesPerPlayer: string; }

export default function ProgressBanner({ progress, teamAName, teamBName, matchesPerPlayer }: Props) {
  const { total, completed, pending, notPlayed, pct, isFinished } = progress;

  return (
    <div className="mb-4">
      {isFinished && (
        <div className="flex items-center gap-2 mb-2 font-bold text-sm" style={{ color: '#FFD700' }}>
          <Trophy size={18} style={{ color: '#FFD700' }} /> 🏆 Tournament Finished — Results Locked
        </div>
      )}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm mb-2">
        <span className="font-black tracking-wide">
          <span style={{ color: '#00BFFF' }}>{teamAName}</span>
          <span className="mx-1" style={{ color: 'rgba(240,237,214,0.4)' }}>vs</span>
          <span style={{ color: '#FFD700' }}>{teamBName}</span>
        </span>
        <span className="flex items-center gap-1 font-semibold" style={{ color: '#34D399' }}>
          <CheckCircle size={13} />{completed} Done
        </span>
        <span className="flex items-center gap-1 font-semibold" style={{ color: '#F5C04E' }}>
          <Clock size={13} />{pending} Pending
        </span>
        {notPlayed > 0 && <span className="flex items-center gap-1" style={{ color: 'rgba(240,237,214,0.5)' }}>
          <XCircle size={13} />{notPlayed} N/P
        </span>}
        <span className="text-xs" style={{ color: 'rgba(240,237,214,0.65)' }}>Total: {total} · Per Player: {matchesPerPlayer}</span>
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
      <p className="text-xs mt-1 font-semibold" style={{ color: 'rgba(240,237,214,0.7)' }}>{pct}% complete</p>
    </div>
  );
}
