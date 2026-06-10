import type { FixtureRound, FixtureMatch, MatchResult, MatchStatus, StatusFilter } from '../types';

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, result }: { status: MatchStatus; result: MatchResult }) {
  if (status === 'pending') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">⏳ Pending</span>;
  if (status === 'not_played') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">— N/P</span>;
  const label = result === 'a_win' ? '✅ A Won' : result === 'b_win' ? '✅ B Won' : '✅ Draw';
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{label}</span>;
}

// ─── Result Buttons ───────────────────────────────────────────────────────────

function ResultButtons({
  match, teamAName, teamBName, onResult, disabled
}: {
  match: FixtureMatch; teamAName: string; teamBName: string;
  onResult: (matchId: string, result: MatchResult) => void; disabled: boolean;
}) {
  const toggle = (result: MatchResult) => {
    onResult(match.id, match.result === result ? null : result);
  };

  const winBtn = (result: MatchResult, label: string, colorActive: string, colorIdle: string) => {
    const isActive = match.result === result;
    return (
      <button
        disabled={disabled}
        onClick={() => toggle(result)}
        className={`flex-1 min-w-[80px] py-2 px-2 rounded-lg text-center transition-all border-2 font-bold text-sm
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md active:scale-95'}
          ${isActive ? colorActive : colorIdle}`}
      >
        🏸 {label}
        {isActive && <div className="text-xs font-semibold opacity-90 mt-0.5">+20 pts</div>}
      </button>
    );
  };

  return (
    <div className="flex gap-1.5 items-stretch">
      {winBtn('a_win', teamAName,
        'bg-teal-900 text-teal-100 border-teal-700 shadow',
        'bg-white text-teal-900 border-teal-300 hover:border-teal-700 hover:bg-teal-50')}
      <div className="flex flex-col gap-1">
        <button
          disabled={disabled}
          onClick={() => toggle('draw')}
          className={`px-3 py-1 rounded text-xs font-bold border-2 transition-all
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${match.result === 'draw'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white text-amber-700 border-amber-300 hover:border-amber-600'}`}
        >Draw</button>
        <button
          disabled={disabled}
          onClick={() => toggle('not_played')}
          className={`px-3 py-1 rounded text-xs font-medium border transition-all
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${match.result === 'not_played'
              ? 'bg-gray-400 text-white border-gray-400'
              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}
        >N/P</button>
      </div>
      {winBtn('b_win', teamBName,
        'bg-red-950 text-red-200 border-red-800 shadow',
        'bg-white text-red-950 border-red-300 hover:border-red-800 hover:bg-red-50')}
    </div>
  );
}

// ─── Score Entry ──────────────────────────────────────────────────────────────

function ScoreEntry({
  match, onScore, disabled
}: {
  match: FixtureMatch; onScore: (matchId: string, scoreA: string, scoreB: string) => void; disabled: boolean;
}) {
  if (match.status === 'pending') return null;

  return (
    <div className="flex items-center gap-1 mt-1">
      <input
        type="text" maxLength={15} placeholder="e.g. 21-18"
        defaultValue={match.scoreA ?? ''}
        onBlur={e => onScore(match.id, e.target.value, match.scoreB ?? '')}
        disabled={disabled}
        className="w-20 border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
      />
      <span className="text-xs text-gray-400">vs</span>
      <input
        type="text" maxLength={15} placeholder="e.g. 18-21"
        defaultValue={match.scoreB ?? ''}
        onBlur={e => onScore(match.id, match.scoreA ?? '', e.target.value)}
        disabled={disabled}
        className="w-20 border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
      />
    </div>
  );
}

// ─── Row Background ───────────────────────────────────────────────────────────

function rowBg(status: MatchStatus) {
  if (status === 'pending') return 'bg-yellow-50';
  if (status === 'not_played') return 'bg-gray-50 opacity-70';
  return 'bg-white';
}

// ─── Single Round View ────────────────────────────────────────────────────────

interface Props {
  rounds: FixtureRound[];
  teamAName: string;
  teamBName: string;
  activeRound: number;
  setActiveRound: (r: number) => void;
  statusFilter: StatusFilter;
  onResult: (matchId: string, result: MatchResult) => void;
  onScore: (matchId: string, scoreA: string, scoreB: string) => void;
  isFinished: boolean;
}

export default function RoundView({
  rounds, teamAName, teamBName, activeRound, setActiveRound,
  statusFilter, onResult, onScore, isFinished,
}: Props) {
  const round = rounds.find(r => r.roundNumber === activeRound);
  if (!round) return null;

  const filtered = round.matches.filter(m => {
    if (statusFilter === 'pending') return m.status === 'pending';
    if (statusFilter === 'completed') return m.status === 'completed' || m.status === 'not_played';
    return true;
  });

  const pendingCount = round.matches.filter(m => m.status === 'pending').length;
  const roundComplete = pendingCount === 0;

  return (
    <div>
      {/* Round Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-4">
        {rounds.map(r => {
          const rPending = r.matches.filter(m => m.status === 'pending').length;
          const rDone = rPending === 0;
          return (
            <button
              key={r.roundNumber}
              onClick={() => setActiveRound(r.roundNumber)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                r.roundNumber === activeRound
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : rDone
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
              }`}
            >
              R{r.roundNumber} {rDone ? '✓' : `⏳${rPending}`}
            </button>
          );
        })}
      </div>

      {/* Round Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">
          Round {round.roundNumber}
          {roundComplete
            ? <span className="ml-2 text-xs text-green-600 font-normal">✅ All done</span>
            : <span className="ml-2 text-xs text-yellow-600 font-normal">⏳ {pendingCount} pending</span>
          }
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveRound(Math.max(1, activeRound - 1))}
            disabled={activeRound === 1}
            className="px-3 py-1 rounded border text-sm text-gray-600 border-gray-300 disabled:opacity-30 hover:bg-gray-50"
          >← Prev</button>
          <button
            onClick={() => setActiveRound(Math.min(rounds.length, activeRound + 1))}
            disabled={activeRound === rounds.length}
            className="px-3 py-1 rounded border text-sm text-gray-600 border-gray-300 disabled:opacity-30 hover:bg-gray-50"
          >Next →</button>
        </div>
      </div>

      {/* Match Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
          <tr className="border-b border-green-900/30" style={{ background: 'linear-gradient(135deg, #082910, #154d21)' }}>
            <th className="px-3 py-2.5 text-left text-xs font-bold text-amber-300 w-12">Court</th>
            <th className="px-3 py-2.5 text-center text-xs font-bold text-blue-200">{teamAName}</th>
            <th className="px-3 py-2.5 text-center text-xs font-bold text-amber-200/80 min-w-[280px]">Mark Result</th>
            <th className="px-3 py-2.5 text-center text-xs font-bold text-red-300">{teamBName}</th>
            <th className="px-3 py-2.5 text-center text-xs font-bold text-amber-200/80 w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No matches for this filter.</td></tr>
            )}
            {filtered.map(m => (
              <tr key={m.id} className={`${rowBg(m.status)} transition-colors`}>
                <td className="px-3 py-3 text-center font-bold text-gray-700 text-sm">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">{m.court}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="font-bold text-blue-700 text-sm">{m.teamAPair[0]}</div>
                  <div className="text-gray-400 text-xs">& {m.teamAPair[1]}</div>
                </td>
                <td className="px-3 py-3">
                  <ResultButtons match={m} teamAName={teamAName} teamBName={teamBName} onResult={onResult} disabled={isFinished} />
                  <ScoreEntry match={m} onScore={onScore} disabled={isFinished} />
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="font-bold text-orange-700 text-sm">{m.teamBPair[0]}</div>
                  <div className="text-gray-400 text-xs">& {m.teamBPair[1]}</div>
                </td>
                <td className="px-3 py-3 text-center">
                  <StatusBadge status={m.status} result={m.result} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
