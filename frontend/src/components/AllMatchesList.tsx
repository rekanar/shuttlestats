import { List, Play, Trash2 } from 'lucide-react';
import type { FixtureRound, MatchResult, MatchStatus, StatusFilter } from '../types';

// ─── Shared result-button styling ─────────────────────────────────────────────
// Team A = cyan, Team B = gold (consistent with pair names & headers); Draw = amber;
// N/P = gray. Selected buttons get a glow in their own colour.
function resultBtnStyle(kind: 'a' | 'b' | 'draw' | 'np', selected: boolean) {
  const c = { a: '#00BFFF', b: '#FFD700', draw: '#F59E0B', np: '#9CA3AF' }[kind];
  return {
    background: selected ? `${c}33` : 'transparent',
    color: selected ? '#ffffff' : c,
    border: `1px solid ${selected ? c : `${c}55`}`,
    boxShadow: selected ? `0 0 14px 1px ${c}aa` : 'none',
  };
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, result, teamAName, teamBName }: {
  status: MatchStatus; result: MatchResult; teamAName: string; teamBName: string;
}) {
  if (status === 'in_progress') return (
    <span className="bs-live-badge px-2 py-0.5 rounded-full text-xs font-bold">
      🔴 Live
    </span>
  );
  if (status === 'pending') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-900/60 text-yellow-200">⏳ Pending</span>;
  if (status === 'not_played') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700/60 text-gray-300">— N/P</span>;
  if (result === 'a_win') return <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(0,191,255,0.18)', color: '#7FE0FF', border: '1px solid rgba(0,191,255,0.5)' }}>✅ {teamAName}</span>;
  if (result === 'b_win') return <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(255,215,0,0.18)', color: '#FFE680', border: '1px solid rgba(255,215,0,0.5)' }}>✅ {teamBName}</span>;
  if (result === 'draw') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-800/70 text-amber-100">✅ Draw</span>;
  return null;
}

// ─── Inline Result Buttons (desktop) ─────────────────────────────────────────

function RowResultButtons({
  match, teamAName, teamBName, onResult, disabled,
}: {
  match: { id: string; result: MatchResult; status: MatchStatus };
  teamAName: string; teamBName: string;
  onResult: (id: string, result: MatchResult) => void;
  disabled: boolean;
}) {
  const toggle = (r: MatchResult) => onResult(match.id, match.result === r ? null : r);
  const base = 'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap hover:brightness-110';

  return (
    <div className="flex items-center gap-1.5 justify-center flex-wrap">
      <button disabled={disabled} onClick={() => toggle('a_win')}
        className={base} style={resultBtnStyle('a', match.result === 'a_win')}>
        🏸 {teamAName}
        {match.result === 'a_win' && <span className="block text-[9px] font-normal opacity-75 leading-none mt-0.5">+20 team · +10 player</span>}
      </button>

      <button disabled={disabled} onClick={() => toggle('draw')}
        className={base} style={resultBtnStyle('draw', match.result === 'draw')}>
        Draw
      </button>

      <button disabled={disabled} onClick={() => toggle('not_played')}
        className={`${base} text-[11px]`} style={resultBtnStyle('np', match.result === 'not_played')}>
        N/P
      </button>

      <button disabled={disabled} onClick={() => toggle('b_win')}
        className={base} style={resultBtnStyle('b', match.result === 'b_win')}>
        🏸 {teamBName}
        {match.result === 'b_win' && <span className="block text-[9px] font-normal opacity-75 leading-none mt-0.5">+20 team · +10 player</span>}
      </button>
    </div>
  );
}

// ─── Mobile Result Buttons (2×2 grid) ─────────────────────────────────────────

function MobileResultButtons({
  match, teamAName, teamBName, onResult, disabled,
}: {
  match: { id: string; result: MatchResult; status: MatchStatus };
  teamAName: string; teamBName: string;
  onResult: (id: string, result: MatchResult) => void;
  disabled: boolean;
}) {
  const toggle = (r: MatchResult) => onResult(match.id, match.result === r ? null : r);
  const base = 'w-full py-2 px-1 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed text-center leading-tight';

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <button disabled={disabled} onClick={() => toggle('a_win')}
        className={base} style={resultBtnStyle('a', match.result === 'a_win')}>
        🏸 {teamAName}
        {match.result === 'a_win' && <span className="block text-[9px] font-normal opacity-75 mt-0.5">+20 · +10pts</span>}
      </button>
      <button disabled={disabled} onClick={() => toggle('draw')}
        className={base} style={resultBtnStyle('draw', match.result === 'draw')}>
        Draw
        {match.result === 'draw' && <span className="block text-[9px] font-normal opacity-75 mt-0.5">+10 · +5pts</span>}
      </button>
      <button disabled={disabled} onClick={() => toggle('not_played')}
        className={`${base} text-[11px]`} style={resultBtnStyle('np', match.result === 'not_played')}>
        N/P
      </button>
      <button disabled={disabled} onClick={() => toggle('b_win')}
        className={base} style={resultBtnStyle('b', match.result === 'b_win')}>
        🏸 {teamBName}
        {match.result === 'b_win' && <span className="block text-[9px] font-normal opacity-75 mt-0.5">+20 · +10pts</span>}
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

// ─── Outcome helpers (win / loss / draw per side) ─────────────────────────────

type Outcome = 'win' | 'loss' | 'draw' | null;

function outcomeFor(side: 'A' | 'B', result: MatchResult): Outcome {
  if (result === 'draw') return 'draw';
  if (result === 'a_win') return side === 'A' ? 'win' : 'loss';
  if (result === 'b_win') return side === 'B' ? 'win' : 'loss';
  return null;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  rounds: FixtureRound[];
  teamAName: string;
  teamBName: string;
  /** Up to two Team A player search terms */
  searchA: [string, string];
  /** Up to two Team B player search terms */
  searchB: [string, string];
  statusFilter: StatusFilter;
  onResult: (matchId: string, result: MatchResult) => void;
  onScore: (matchId: string, scoreA: string, scoreB: string) => void;
  onStart: (matchId: string) => void;
  onDeleteMatch: (matchId: string) => void;
  isFinished: boolean;
  /** When false, all editing controls are hidden (read-only viewer) */
  canEdit: boolean;
}

export default function AllMatchesList({
  rounds, teamAName, teamBName, searchA, searchB, statusFilter, onResult, onScore, onStart, onDeleteMatch, isFinished, canEdit,
}: Props) {
  // A match can only be edited when the viewer is an admin AND the fixture is not locked.
  const editable = canEdit && isFinished !== true;

  const allMatches = rounds.flatMap(r =>
    r.matches.map(m => ({ ...m, roundNumber: r.roundNumber }))
  );

  const total = allMatches.length;
  const done = allMatches.filter(m => m.status !== 'pending').length;

  // ─── Team-aware search ──────────────────────────────────────────────────────
  // Team A terms filter the Team A side; Team B terms filter the Team B side.
  // Both can be used together to pinpoint the exact A-pair vs B-pair matchup.
  const aTerms = searchA.map(s => s.trim().toLowerCase()).filter(Boolean);
  const bTerms = searchB.map(s => s.trim().toLowerCase()).filter(Boolean);
  const allTerms = [...aTerms, ...bTerms];
  const hasSearch = allTerms.length > 0;

  const sideMatches = (pair: [string, string], terms: string[]) =>
    terms.every(t => pair.some(p => p.toLowerCase().includes(t)));

  const searchFiltered = !hasSearch
    ? allMatches
    : allMatches.filter(m => sideMatches(m.teamAPair, aTerms) && sideMatches(m.teamBPair, bTerms));

  const filtered = searchFiltered.filter(m => {
    if (statusFilter === 'pending') return m.status === 'pending';
    if (statusFilter === 'in_progress') return m.status === 'in_progress';
    if (statusFilter === 'completed') return m.status === 'completed' || m.status === 'not_played';
    return true;
  });

  // Highlight any searched term within a player name.
  function highlight(name: string) {
    const n = name.toLowerCase();
    const matched = allTerms.filter(t => n.includes(t)).sort((a, b) => b.length - a.length);
    if (!matched.length) return <span>{name}</span>;
    const q = matched[0];
    const parts = name.split(new RegExp(`(${escapeRegExp(q)})`, 'gi'));
    return (
      <span>
        {parts.map((p, i) =>
          p.toLowerCase() === q
            ? <mark key={i} style={{ background: 'rgba(212,175,55,0.4)', color: '#FFE066', borderRadius: '2px', padding: '0 2px' }}>{p}</mark>
            : <span key={i}>{p}</span>
        )}
      </span>
    );
  }

  // Render a pair as a glowing pill that reflects win / loss / draw.
  function renderPair(pair: [string, string], side: 'A' | 'B', result: MatchResult) {
    const oc = outcomeFor(side, result);
    const pillClass =
      oc === 'win' ? 'bs-pair bs-pair-win'
      : oc === 'loss' ? 'bs-pair bs-pair-loss'
      : oc === 'draw' ? 'bs-pair bs-pair-draw'
      : 'bs-pair';
    // Both players share the SAME styling: bold, same size, same team color.
    // Team A = cyan, Team B = gold (matching the column headers and team panels).
    const color = side === 'A' ? '#00BFFF' : '#FFD700';

    return (
      <div className={pillClass}>
        <div className="font-bold text-sm leading-tight" style={{ color }}>{highlight(pair[0])}</div>
        <div className="font-bold text-sm leading-tight" style={{ color }}>&amp; {highlight(pair[1])}</div>
        {oc === 'win' && <span className="bs-outcome-tag bs-tag-win">✓ Won</span>}
        {oc === 'loss' && <span className="bs-outcome-tag bs-tag-loss">✕ Lost</span>}
        {oc === 'draw' && <span className="bs-outcome-tag bs-tag-draw">= Draw</span>}
      </div>
    );
  }

  // Outcome-based row accent class.
  function rowAccent(status: MatchStatus, result: MatchResult) {
    if (status === 'in_progress') return 'bs-live-row';
    if (result === 'a_win' || result === 'b_win') return 'bs-row-win';
    if (result === 'draw') return 'bs-row-draw';
    if (status === 'not_played') return 'bs-row-np';
    return 'bs-row-pending';
  }

  // Search summary chip text.
  const searchSummary = (() => {
    if (!hasSearch) return null;
    const aLabel = aTerms.length ? `🔵 ${searchA.filter(Boolean).join(' & ')}` : '';
    const bLabel = bTerms.length ? `🟡 ${searchB.filter(Boolean).join(' & ')}` : '';
    const both = aLabel && bLabel;
    return `${aLabel}${both ? '  vs  ' : ''}${bLabel} — ${filtered.length} match${filtered.length !== 1 ? 'es' : ''}`;
  })();

  const emptyMsg = hasSearch
    ? 'No matches found for this search. Try clearing one of the teams.'
    : 'No matches for this filter.';

  return (
    <div>
      {/* Header */}
      <div className="bs-section-header">
        <List size={15} className="text-amber-400" />
        <span>All Matches</span>
        {searchSummary && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-700/40 text-amber-200 font-normal">
            {searchSummary}
          </span>
        )}
        <span className="ml-auto text-amber-400/60 text-xs font-normal">{done}/{total} played</span>
      </div>

      {/* ── Mobile card view (< md) ──────────────────────────────────── */}
      <div className="md:hidden divide-y divide-white/5">
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-amber-200/40 text-sm">{emptyMsg}</div>
        )}
        {filtered.map((m, idx) => {
          const isLive = m.status === 'in_progress';
          return (
            <div key={m.id} className={`px-3 py-3 ${rowAccent(m.status, m.result)}`}
              style={{
                background: isLive ? 'rgba(255,100,0,0.07)'
                  : (m.status === 'completed' || m.status === 'not_played') ? 'rgba(255,255,255,0.025)'
                  : 'transparent',
              }}>
              {/* Row meta: match # + round/court + status badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-200/40 text-[11px] font-mono">
                  #{idx + 1} · R{m.roundNumber}/C{m.court}
                </span>
                <StatusBadge status={m.status} result={m.result} teamAName={teamAName} teamBName={teamBName} />
              </div>
              {/* Pairs */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="flex-1 flex justify-center">{renderPair(m.teamAPair, 'A', m.result)}</div>
                <div className="text-amber-200/30 text-xs font-bold shrink-0">vs</div>
                <div className="flex-1 flex justify-center">{renderPair(m.teamBPair, 'B', m.result)}</div>
              </div>
              {/* Result buttons — show Start for pending, result grid for in_progress/completed */}
              {m.status === 'pending' && editable && (
                <button
                  onClick={() => onStart(m.id)}
                  className="w-full py-2 rounded-lg text-xs font-bold border border-orange-600/50 text-orange-300 bg-orange-900/20 flex items-center justify-center gap-2 hover:bg-orange-900/40 transition-colors"
                >
                  <Play size={12} /> Start Match — Mark Live
                </button>
              )}
              {(m.status === 'in_progress' || m.status === 'completed' || m.status === 'not_played') && (
                <MobileResultButtons match={m} teamAName={teamAName} teamBName={teamBName}
                  onResult={onResult} disabled={!editable} />
              )}
              {m.status === 'in_progress' && editable && (
                <button
                  onClick={() => onStart(m.id)}
                  className="mt-1.5 w-full py-1 rounded-lg text-[10px] font-semibold border border-orange-700/30 text-orange-400/60 hover:text-orange-300 transition-colors"
                >
                  ✕ Cancel Live
                </button>
              )}
              <ScoreEntry match={m} onScore={onScore} disabled={!editable} />
              {/* Delete match */}
              {editable && (
                <button
                  onClick={() => onDeleteMatch(m.id)}
                  className="mt-2 w-full py-1 rounded-lg text-[10px] font-semibold border border-red-800/30 text-red-400/50 hover:text-red-300 hover:border-red-600/50 hover:bg-red-900/15 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 size={10} /> Remove this match
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop table view (≥ md) ─────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #082910, #154d21)' }}>
              <th className="px-3 py-2.5 text-left text-amber-300 font-bold text-xs w-10">#</th>
              <th className="px-3 py-2.5 text-left text-amber-300 font-bold text-xs w-16">Rd/Ct</th>
              <th className="px-3 py-2.5 text-center text-xs font-bold" style={{ color: '#00BFFF' }}>{teamAName} Pair</th>
              <th className="px-3 py-2.5 text-center text-amber-200/50 font-bold text-xs w-8">vs</th>
              <th className="px-3 py-2.5 text-center text-xs font-bold" style={{ color: '#FFD700' }}>{teamBName} Pair</th>
              <th className="px-3 py-2.5 text-center text-amber-200/80 font-bold text-xs min-w-[340px]">Mark Result</th>
              <th className="px-3 py-2.5 text-center text-amber-200/60 font-bold text-xs w-28">Status</th>
              <th className="px-3 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-amber-200/40 text-sm">{emptyMsg}</td>
              </tr>
            )}
            {filtered.map((m, idx) => {
              const isLive = m.status === 'in_progress';
              return (
                <tr key={m.id} className={`transition-colors hover:bg-white/5 ${rowAccent(m.status, m.result)}`}
                  style={{
                    background: isLive ? 'rgba(255,100,0,0.07)'
                      : (m.status === 'completed' || m.status === 'not_played') ? 'rgba(255,255,255,0.025)'
                      : 'transparent',
                  }}>
                  <td className="px-3 py-3 text-amber-200/40 text-xs font-mono">{idx + 1}</td>
                  <td className="px-3 py-3 text-amber-200/50 text-xs">
                    R{m.roundNumber}<span className="text-amber-200/30">/C{m.court}</span>
                  </td>
                  <td className="px-3 py-3 text-center">{renderPair(m.teamAPair, 'A', m.result)}</td>
                  <td className="px-1 py-3 text-center text-amber-200/30 text-xs font-bold">vs</td>
                  <td className="px-3 py-3 text-center">{renderPair(m.teamBPair, 'B', m.result)}</td>
                  <td className="px-3 py-3">
                    {m.status === 'pending' && editable ? (
                      <button
                        onClick={() => onStart(m.id)}
                        className="mx-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-orange-600/50 text-orange-300 bg-orange-900/20 hover:bg-orange-900/40 transition-colors"
                      >
                        <Play size={11} /> Start Live
                      </button>
                    ) : (
                      <>
                        <RowResultButtons match={m} teamAName={teamAName} teamBName={teamBName}
                          onResult={onResult} disabled={!editable} />
                        {m.status === 'in_progress' && editable && (
                          <button
                            onClick={() => onStart(m.id)}
                            className="mt-1 mx-auto flex items-center gap-1 text-[10px] text-orange-400/50 hover:text-orange-300 transition-colors"
                          >
                            ✕ Cancel Live
                          </button>
                        )}
                      </>
                    )}
                    <ScoreEntry match={m} onScore={onScore} disabled={!editable} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <StatusBadge status={m.status} result={m.result} teamAName={teamAName} teamBName={teamBName} />
                  </td>
                  {/* Delete column */}
                  <td className="px-2 py-3 text-center">
                    {editable && (
                      <button
                        onClick={() => onDeleteMatch(m.id)}
                        title="Remove this match"
                        className="p-1.5 rounded-lg text-red-500/40 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
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
