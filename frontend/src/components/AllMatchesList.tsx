import { List } from 'lucide-react';
import type { FixtureRound, MatchResult, MatchStatus, StatusFilter } from '../types';

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, result, teamAName, teamBName }: {
  status: MatchStatus; result: MatchResult; teamAName: string; teamBName: string;
}) {
  if (status === 'pending') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-900/60 text-yellow-200">⏳ Pending</span>;
  if (status === 'not_played') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700/60 text-gray-300">— N/P</span>;
  if (result === 'a_win') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-900/70 text-teal-200">✅ {teamAName}</span>;
  if (result === 'b_win') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-900/70 text-red-200">✅ {teamBName}</span>;
  if (result === 'draw') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-800/70 text-amber-100">✅ Draw</span>;
  return null;
}

// ─── Inline Result Buttons ────────────────────────────────────────────────────

function RowResultButtons({
  match, teamAName, teamBName, onResult, disabled,
}: {
  match: { id: string; result: MatchResult; status: MatchStatus };
  teamAName: string; teamBName: string;
  onResult: (id: string, result: MatchResult) => void;
  disabled: boolean;
}) {
  const toggle = (r: MatchResult) => onResult(match.id, match.result === r ? null : r);
  const base = 'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';

  return (
    <div className="flex items-center gap-1.5 justify-center flex-wrap">
      <button disabled={disabled} onClick={() => toggle('a_win')}
        className={`${base} ${match.result === 'a_win'
          ? 'bg-teal-800 text-teal-100 border-teal-600 shadow-lg'
          : 'bg-transparent text-teal-300 border-teal-700/50 hover:border-teal-500 hover:bg-teal-900/30'}`}>
        🏸 {teamAName}
        {match.result === 'a_win' && <span className="block text-[9px] font-normal opacity-75 leading-none mt-0.5">+20 team · +10 player</span>}
      </button>

      <button disabled={disabled} onClick={() => toggle('draw')}
        className={`${base} ${match.result === 'draw'
          ? 'bg-amber-700 text-amber-100 border-amber-500 shadow'
          : 'bg-transparent text-amber-400 border-amber-700/40 hover:border-amber-500 hover:bg-amber-900/20'}`}>
        Draw
      </button>

      <button disabled={disabled} onClick={() => toggle('not_played')}
        className={`${base} text-[11px] ${match.result === 'not_played'
          ? 'bg-gray-600 text-gray-100 border-gray-500'
          : 'bg-transparent text-gray-500 border-gray-700/30 hover:border-gray-500'}`}>
        N/P
      </button>

      <button disabled={disabled} onClick={() => toggle('b_win')}
        className={`${base} ${match.result === 'b_win'
          ? 'bg-red-900 text-red-100 border-red-700 shadow-lg'
          : 'bg-transparent text-red-300 border-red-800/50 hover:border-red-600 hover:bg-red-900/30'}`}>
        🏸 {teamBName}
        {match.result === 'b_win' && <span className="block text-[9px] font-normal opacity-75 leading-none mt-0.5">+20 team · +10 player</span>}
      </button>
    </div>
  );
}

// ─── Score Entry ──────────────────────────────────────────────────────────────

function ScoreEntry({
  match, onScore, disabled,
}: {
  match: { id: string; result: MatchResult; scoreA: string | null; scoreB: string | null };
  onScore: (id: string, scoreA: string, scoreB: string) => void;
  disabled: boolean;
}) {
  if (match.result === null || match.result === 'not_played') return null;
  return (
    <div className="flex items-center justify-center gap-1 mt-1.5">
      <input type="text" maxLength={15} placeholder="A score"
        defaultValue={match.scoreA ?? ''}
        onBlur={e => onScore(match.id, e.target.value, match.scoreB ?? '')}
        disabled={disabled}
        className="w-16 text-center border border-amber-800/30 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
        style={{ background: 'rgba(255,255,255,0.07)', color: '#f0edd6' }} />
      <span className="text-amber-200/40 text-xs">–</span>
      <input type="text" maxLength={15} placeholder="B score"
        defaultValue={match.scoreB ?? ''}
        onBlur={e => onScore(match.id, match.scoreA ?? '', e.target.value)}
        disabled={disabled}
        className="w-16 text-center border border-amber-800/30 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
        style={{ background: 'rgba(255,255,255,0.07)', color: '#f0edd6' }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  rounds: FixtureRound[];
  teamAName: string;
  teamBName: string;
  playerFilter: string;
  statusFilter: StatusFilter;
  onResult: (matchId: string, result: MatchResult) => void;
  onScore: (matchId: string, scoreA: string, scoreB: string) => void;
  isFinished: boolean;
}

export default function AllMatchesList({
  rounds, teamAName, teamBName, playerFilter, statusFilter, onResult, onScore, isFinished,
}: Props) {
  const allMatches = rounds.flatMap(r =>
    r.matches.map(m => ({ ...m, roundNumber: r.roundNumber }))
  );

  const total = allMatches.length;
  const done = allMatches.filter(m => m.status !== 'pending').length;

  const query = playerFilter.trim().toLowerCase();
  const playerFiltered = query
    ? allMatches.filter(m =>
        m.teamAPair[0].toLowerCase().includes(query) ||
        m.teamAPair[1].toLowerCase().includes(query) ||
        m.teamBPair[0].toLowerCase().includes(query) ||
        m.teamBPair[1].toLowerCase().includes(query)
      )
    : allMatches;

  const filtered = playerFiltered.filter(m => {
    if (statusFilter === 'pending') return m.status === 'pending';
    if (statusFilter === 'completed') return m.status !== 'pending';
    return true;
  });

  // Highlight matched name letters
  function highlight(name: string) {
    if (!query) return <span>{name}</span>;
    const parts = name.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((p, i) =>
          p.toLowerCase() === query
            ? <mark key={i} style={{ background: 'rgba(212,175,55,0.4)', color: '#FFE066', borderRadius: '2px', padding: '0 2px' }}>{p}</mark>
            : <span key={i}>{p}</span>
        )}
      </span>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bs-section-header">
        <List size={15} className="text-amber-400" />
        <span>All Matches</span>
        {query && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-700/40 text-amber-200 font-normal">
            Player: {playerFilter} — {filtered.length} match{filtered.length !== 1 ? 'es' : ''}
          </span>
        )}
        <span className="ml-auto text-amber-400/60 text-xs font-normal">{done}/{total} played</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #082910, #154d21)' }}>
              <th className="px-3 py-2.5 text-left text-amber-300 font-bold text-xs w-10">#</th>
              <th className="px-3 py-2.5 text-left text-amber-300 font-bold text-xs w-16">Rd/Ct</th>
              <th className="px-3 py-2.5 text-center text-xs font-bold" style={{ color: '#4DD4C8' }}>{teamAName} Pair</th>
              <th className="px-3 py-2.5 text-center text-amber-200/50 font-bold text-xs w-8">vs</th>
              <th className="px-3 py-2.5 text-center text-xs font-bold" style={{ color: '#FF7070' }}>{teamBName} Pair</th>
              <th className="px-3 py-2.5 text-center text-amber-200/80 font-bold text-xs min-w-[340px]">Mark Result</th>
              <th className="px-3 py-2.5 text-center text-amber-200/60 font-bold text-xs w-28">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-amber-200/40 text-sm">
                  {query ? `No matches found for "${playerFilter}"` : 'No matches for this filter.'}
                </td>
              </tr>
            )}
            {filtered.map((m, idx) => {
              const isAWin = m.result === 'a_win';
              const isBWin = m.result === 'b_win';
              const isDone = m.status !== 'pending';
              return (
                <tr key={m.id} className="transition-colors hover:bg-white/5"
                  style={{
                    background: isAWin ? 'rgba(13,124,124,0.10)'
                      : isBWin ? 'rgba(139,26,26,0.10)'
                      : isDone ? 'rgba(255,255,255,0.03)'
                      : 'rgba(255,230,80,0.03)',
                  }}>
                  <td className="px-3 py-3 text-amber-200/40 text-xs font-mono">{idx + 1}</td>
                  <td className="px-3 py-3 text-amber-200/50 text-xs">
                    R{m.roundNumber}<span className="text-amber-200/30">/C{m.court}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="font-bold" style={{ color: isAWin ? '#4DD4C8' : '#7abfba' }}>{highlight(m.teamAPair[0])}</div>
                    <div className="text-xs mt-0.5" style={{ color: isAWin ? '#99ddd9' : 'rgba(170,210,207,0.55)' }}>
                      &amp; {highlight(m.teamAPair[1])}
                    </div>
                  </td>
                  <td className="px-1 py-3 text-center text-amber-200/30 text-xs font-bold">vs</td>
                  <td className="px-3 py-3 text-center">
                    <div className="font-bold" style={{ color: isBWin ? '#FF7070' : '#c97070' }}>{highlight(m.teamBPair[0])}</div>
                    <div className="text-xs mt-0.5" style={{ color: isBWin ? '#ffaaaa' : 'rgba(210,150,150,0.55)' }}>
                      &amp; {highlight(m.teamBPair[1])}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <RowResultButtons match={m} teamAName={teamAName} teamBName={teamBName}
                      onResult={onResult} disabled={isFinished} />
                    <ScoreEntry match={m} onScore={onScore} disabled={isFinished} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <StatusBadge status={m.status} result={m.result} teamAName={teamAName} teamBName={teamBName} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
