import type { PairStats } from '../types';
import { Trophy } from 'lucide-react';

interface Props {
  pairStats: PairStats[];
  teamAName: string;
  teamBName: string;
  pointsScheme?: { win: number; draw: number; loss: number };
}

export default function LivePointsTable({ pairStats, teamAName, teamBName }: Props) {
  const top3 = pairStats.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bs-section-header">
        <Trophy size={15} className="text-amber-400" />
        <span>Pair Standings</span>
        <span className="ml-auto text-amber-400/60 text-xs font-normal">10 pts per player win</span>
      </div>

      {/* Top 3 Leaderboard */}
      {top3.length > 0 && (
        <div className="flex gap-2 px-4 py-3 border-b border-amber-100" style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' }}>
          {top3.map((s, i) => (
            <div key={s.pairKey} className="flex-1 text-center">
              <div className="text-xl mb-1">{medals[i]}</div>
              <div className="text-xs font-semibold text-gray-800 leading-tight">{s.players[0]}</div>
              <div className="text-xs text-gray-500">&amp; {s.players[1]}</div>
              <div className={`text-xs mt-1 font-bold ${s.team === 'A' ? 'text-blue-600' : 'text-orange-600'}`}>
                {s.team === 'A' ? teamAName : teamBName}
              </div>
              <div className="text-sm font-bold text-gray-900 mt-0.5">{s.points} pts</div>
              <div className="text-xs text-gray-500">{s.winPct}%</div>
            </div>
          ))}
        </div>
      )}

      {/* Full table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-amber-100" style={{ background: 'linear-gradient(135deg, #082910, #154d21)' }}>
              <th className="px-3 py-2 text-left text-amber-200/80">#</th>
              <th className="px-3 py-2 text-left text-amber-200/80">Pair</th>
              <th className="px-3 py-2 text-center text-amber-200/80">Team</th>
              <th className="px-3 py-2 text-center text-amber-200/80">P</th>
              <th className="px-3 py-2 text-center text-amber-200/80">W</th>
              <th className="px-3 py-2 text-center text-amber-200/80">D</th>
              <th className="px-3 py-2 text-center text-amber-200/80">L</th>
              <th className="px-3 py-2 text-center text-amber-400 font-black">Pts</th>
              <th className="px-3 py-2 text-center text-amber-200/80">Win%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pairStats.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400">Enter results to see standings.</td></tr>
            )}
            {pairStats.map((s, i) => (
              <tr key={s.pairKey} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                <td className="px-3 py-2 font-medium text-gray-800">{s.players[0]} &amp; {s.players[1]}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${
                    s.team === 'A'
                      ? 'text-white'
                      : 'text-white'
                  }`} style={{ background: s.team === 'A' ? '#0D7C7C' : '#8B1A1A' }}>
                    {s.team === 'A' ? teamAName : teamBName}
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-gray-600">{s.played}</td>
                <td className="px-3 py-2 text-center text-green-600 font-medium">{s.won}</td>
                <td className="px-3 py-2 text-center text-gray-500">{s.drawn}</td>
                <td className="px-3 py-2 text-center text-red-400">{s.lost}</td>
                <td className="px-3 py-2 text-center font-bold text-indigo-700">{s.points}</td>
                <td className="px-3 py-2 text-center text-gray-600">{s.winPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
