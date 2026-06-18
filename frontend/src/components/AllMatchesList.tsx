import { List, Trash2 } from 'lucide-react';
import type { FixtureRound, MatchResult, MatchStatus, StatusFilter } from '../types';

// ─── Shared result-button styling ─────────────────────────────────────────────
// The tapped team is the WINNER; the other side is the loss. Tap the selected
// team again to clear back to Pending. `color` is the team's chosen hex.
function resultBtnStyle(color: string, selected: boolean) {
  return {
    background: selected ? `${color}33` : 'transparent',
    color: selected ? '#ffffff' : color,
    border: `1px solid ${selected ? color : `${color}55`}`,
    boxShadow: selected ? `0 0 14px 1px ${color}aa` : 'none',
  };
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, result, teamAName, teamBName, teamAColor, teamBColor }: {
  status: MatchStatus; result: MatchResult; teamAName: string; teamBName: string; teamAColor: string; teamBColor: string;
}) {
  if (status === 'pending') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-900/60 text-yellow-200">⏳ Pending</span>;
  if (status === 'not_played') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700/60 text-gray-300">— N/P</span>;
  if (result === 'a_win') return <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${teamAColor}2E`, color: teamAColor, border: `1px solid ${teamAColor}80` }}>✅ {teamAName}</span>;
  if (result === 'b_win') return <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${teamBColor}2E`, color: teamBColor, border: `1px solid ${teamBColor}80` }}>✅ {teamBName}</span>;
  if (result === 'draw') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-800/70 text-amber-100">✅ Draw</span>;
  return null;
}

// ─── Inline Win buttons (desktop) ─────────────────────────────────────────────

function RowResultButtons({
  match, teamAName, teamBName, teamAColor, teamBColor, onResult, disabled,
}: {
  match: { id: string; result: MatchResult; status: MatchStatus };
  teamAName: string; teamBName: string; teamAColor: string; teamBColor: string;
  onResult: (id: string, result: MatchResult) => void;
  disabled: boolean;
}) {
  const toggle = (r: MatchResult) => onResult(match.id, match.result === r ? null : r);
  const base = 'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap hover:brightness-110';

  return (
    <div className="flex items-center gap-2 justify-center">
      <button disabled={disabled} onClick={() => toggle('a_win')}
        className={base} style={resultBtnStyle(teamAColor, match.result === 'a_win')}>
        🏸 {teamAName} Won
      </button>
      <button disabled={disabled} onClick={() => toggle('b_win')}
        className={base} style={resultBtnStyle(teamBColor, match.result === 'b_win')}>
        🏸 {teamBName} Won
      </button>
    </div>
  );
}

// ─── Mobile Win buttons (2-col) ───────────────────────────────────────────────

function MobileResultButtons({
  match, teamAName, teamBName, teamAColor, teamBColor, onResult, disabled,
}: {
  match: { id: string; result: MatchResult; status: MatchStatus };
  teamAName: string; teamBName: string; teamAColor: string; teamBColor: string;
  onResult: (id: string, result: MatchResult) => void;
  disabled: boolean;
}) {
  const toggle = (r: MatchResult) => onResult(match.id, match.result === r ? null : r);
  const base = 'w-full py-2 px-1 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed text-center leading-tight';

  return (
    <div className="grid grid-cols-2 gap-2">
      <button disabled={disabled} onClick={() => toggle('a_win')}
        className={base} style={resultBtnStyle(teamAColor, match.result === 'a_win')}>
        🏸 {teamAName} Won
      </button>
      <button disabled={disabled} onClick={() => toggle('b_win')}
        className={base} style={resultBtnStyle(teamBColor, match.result === 'b_win')}>
        🏸 {teamBName} Won
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
      <input type="text" inputMode="numeric" maxLength={15} placeholder="A score"
        defaultValue={match.scoreA ?? ''}
        onBlur={e => onScore(match.id, e.target.value, match.scoreB ?? '')}
        disabled={disabled}
        className="w-14 text-center border border-amber-800/30 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
        style={{ background: 'rgba(255,255,255,0.07)', color: '#f0edd6' }} />
      <span className="text-amber-200/40 text-xs">–</span>
      <input type="text" inputMode="numeric" maxLength={15} placeholder="B score"
        defaultValue={match.scoreB ?? ''}
        onBlur={e => onScore(match.id, match.scoreA ?? '', e.target.value)}
        disabled={disabled}
        className="w-14 text-center border border-amber-800/30 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
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
  teamAColor: string;
  teamBColor: string;
  /** Up to two Team A player search terms */
  searchA: [string, string];
  /** Up to two Team B player search terms */
  searchB: [string, string];
  statusFilter: StatusFilter;
  /** Filter to a single match number (#); empty = show all */
  matchNumberFilter: string;
  onResult: (matchId: string, result: MatchResult) => void;
  onScore: (matchId: string, scoreA: string, scoreB: string) => void;
  onDeleteMatch: (matchId: string) => void;
  isFinished: boolean;
  /** When false, all editing controls are hidden (read-only viewer) */
  canEdit: boolean;
}

export default function AllMatchesList({
  rounds, teamAName, teamBName, teamAColor, teamBColor, searchA, searchB, statusFilter, matchNumberFilter, onResult, onScore, onDeleteMatch, isFinished, canEdit,
}: Props) {
  // A match can only be edited when the viewer is an admin AND the fixture is not locked.
  const editable = canEdit && isFinished !== true;

  // Stable, global match number (#1..N) — independent of the active filters.
  const allMatches = rounds.flatMap(r =>
    r.matches.map(m => ({ ...m, roundNumber: r.roundNumber }))
  ).map((m, i) => ({ ...m, matchNo: i + 1 }));

  const total = allMatches.length;
  const done = allMatches.filter(m => m.status !== 'pending').length;

  // ─── Team-aware search ──────────────────────────────────────────────────────
  const aTerms = searchA.map(s => s.trim().toLowerCase()).filter(Boolean);
  const bTerms = searchB.map(s => s.trim().toLowerCase()).filter(Boolean);
  const allTerms = [...aTerms, ...bTerms];
  const hasSearch = allTerms.length > 0;
  const matchNo = matchNumberFilter.trim();

  const sideMatches = (pair: [string, string], terms: string[]) =>
    terms.every(t => pair.some(p => p.toLowerCase().includes(t)));

  const filtered = allMatches
    .filter(m => (matchNo ? String(m.matchNo) === matchNo : true))
    .filter(m => !hasSearch ? true : (sideMatches(m.teamAPair, aTerms) && sideMatches(m.teamBPair, bTerms)))
    .filter(m => {
      if (statusFilter === 'pending') return m.status === 'pending';
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
    const color = side === 'A' ? teamAColor : teamBColor;

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

  const emptyMsg = matchNo
    ? `No match #${matchNo}.`
    : hasSearch
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
        <span className="ml-auto text-slate-300 text-xs font-normal">{done}/{total} played</span>
      </div>

      {/* ── Mobile card view (< md) ──────────────────────────────────── */}
      <div className="md:hidden divide-y divide-white/5">
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-amber-200/40 text-sm">{emptyMsg}</div>
        )}
        {filtered.map((m) => (
          <div key={m.id} className={`px-3 py-2.5 ${rowAccent(m.status, m.result)}`}
            style={{
              background: (m.status === 'completed' || m.status === 'not_played') ? 'rgba(255,255,255,0.025)' : 'transparent',
            }}>
            {/* Row meta: match # + round/court + status badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-[11px] font-mono">
                #{m.matchNo} · R{m.roundNumber}/C{m.court}
              </span>
              <StatusBadge status={m.status} result={m.result} teamAName={teamAName} teamBName={teamBName} teamAColor={teamAColor} teamBColor={teamBColor} />
            </div>
            {/* Pairs */}
            <div className="flex items-center justify-center gap-2 mb-2.5">
              <div className="flex-1 flex justify-center">{renderPair(m.teamAPair, 'A', m.result)}</div>
              <div className="text-amber-200/30 text-xs font-bold shrink-0">vs</div>
              <div className="flex-1 flex justify-center">{renderPair(m.teamBPair, 'B', m.result)}</div>
            </div>
            {/* Win buttons — shown directly (admin marks winner in one tap) */}
            {editable && (
              <MobileResultButtons match={m} teamAName={teamAName} teamBName={teamBName}
                teamAColor={teamAColor} teamBColor={teamBColor}
                onResult={onResult} disabled={!editable} />
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
        ))}
      </div>

      {/* ── Desktop table view (≥ md) ─────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th className="px-2 py-2.5 text-left text-slate-300 font-bold text-xs w-10">#</th>
              <th className="px-2 py-2.5 text-left text-slate-300 font-bold text-xs w-14">Rd/Ct</th>
              <th className="px-2 py-2.5 text-center text-xs font-bold" style={{ color: teamAColor }}>{teamAName} Pair</th>
              <th className="px-1 py-2.5 text-center text-slate-400 font-bold text-xs w-8">vs</th>
              <th className="px-2 py-2.5 text-center text-xs font-bold" style={{ color: teamBColor }}>{teamBName} Pair</th>
              <th className="px-2 py-2.5 text-center text-slate-200 font-bold text-xs w-56">Mark Winner</th>
              <th className="px-2 py-2.5 text-center text-slate-300 font-bold text-xs w-24">Status</th>
              <th className="px-1 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-amber-200/40 text-sm">{emptyMsg}</td>
              </tr>
            )}
            {filtered.map((m) => (
              <tr key={m.id} className={`transition-colors hover:bg-white/5 ${rowAccent(m.status, m.result)}`}
                style={{
                  background: (m.status === 'completed' || m.status === 'not_played') ? 'rgba(255,255,255,0.025)' : 'transparent',
                }}>
                <td className="px-2 py-2.5 text-slate-400 text-xs font-mono">{m.matchNo}</td>
                <td className="px-2 py-2.5 text-slate-300 text-xs">
                  R{m.roundNumber}<span className="text-slate-500">/C{m.court}</span>
                </td>
                <td className="px-2 py-2.5 text-center">{renderPair(m.teamAPair, 'A', m.result)}</td>
                <td className="px-1 py-2.5 text-center text-slate-500 text-xs font-bold">vs</td>
                <td className="px-2 py-2.5 text-center">{renderPair(m.teamBPair, 'B', m.result)}</td>
                <td className="px-2 py-2.5">
                  {editable
                    ? <RowResultButtons match={m} teamAName={teamAName} teamBName={teamBName} teamAColor={teamAColor} teamBColor={teamBColor} onResult={onResult} disabled={!editable} />
                    : null}
                  <ScoreEntry match={m} onScore={onScore} disabled={!editable} />
                </td>
                <td className="px-2 py-2.5 text-center">
                  <StatusBadge status={m.status} result={m.result} teamAName={teamAName} teamBName={teamBName} teamAColor={teamAColor} teamBColor={teamBColor} />
                </td>
                {/* Delete column */}
                <td className="px-1 py-2.5 text-center">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
