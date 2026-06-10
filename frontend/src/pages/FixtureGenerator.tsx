import { useState, useEffect, useCallback, useRef } from 'react';
import { fixturesApi } from '../api/fixturesApi';
import TeamInput from '../components/TeamInput';
import ProgressBanner from '../components/ProgressBanner';
import AllMatchesList from '../components/AllMatchesList';
import StatsPanel from '../components/StatsPanel';
import TeamScoreBoard from '../components/TeamScoreBoard';
import type {
  Fixture, CreateFixturePayload, MatchResult, StatsResponse, StatusFilter,
} from '../types';
import { BarChart2, Calendar, RefreshCw, Search, Trophy, X } from 'lucide-react';

type Tab = 'schedule' | 'stats';

// ─── BADMINTON STARZ Header ───────────────────────────────────────────────────

const BADMINTON_COLORS = [
  '#FF3333','#FF7700','#FFCC00','#AAEE00',
  '#00DD88','#00BBCC','#3399FF','#9966FF','#FF44AA',
];
const STARZ_COLORS = ['#FF3333','#FF9900','#FFEE00','#33DD77','#22CCFF'];

const ORBIT_STARS = [
  { dur:'3.5s', delay:'0s',    color:'#FF3333', sz:'13px' },
  { dur:'4.8s', delay:'-0.6s', color:'#FF7700', sz:'10px' },
  { dur:'5.2s', delay:'-1.3s', color:'#FFCC00', sz:'12px' },
  { dur:'3.8s', delay:'-2.0s', color:'#00DD88', sz:'11px' },
  { dur:'4.3s', delay:'-2.6s', color:'#00BBCC', sz:'10px' },
  { dur:'5.8s', delay:'-0.4s', color:'#3399FF', sz:'13px' },
  { dur:'3.2s', delay:'-3.1s', color:'#9966FF', sz:'10px' },
  { dur:'4.6s', delay:'-1.7s', color:'#FF44AA', sz:'12px' },
];

function BrandLogo() {
  return (
    <div className="bs-brand" aria-label="BADMINTON STARZ">
      {ORBIT_STARS.map((s, i) => (
        <span key={i} className="bs-star-orb"
          style={{ '--dur': s.dur, '--delay': s.delay, '--color': s.color, '--sz': s.sz } as React.CSSProperties}>
          ✦
        </span>
      ))}
      <div className="bs-brand-row">
        {'BADMINTON'.split('').map((ch, i) => (
          <span key={i} className="bs-ch-bad"
            style={{ '--ch-color': BADMINTON_COLORS[i], animationDelay: `${i * 0.15}s` } as React.CSSProperties}>
            {ch}
          </span>
        ))}
        <span className="bs-brand-gap" />
        {'STARZ'.split('').map((ch, i) => (
          <span key={i} className="bs-ch-starz"
            style={{ '--ch-color': STARZ_COLORS[i], animationDelay: `${(i + 9) * 0.15}s` } as React.CSSProperties}>
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Player Search Card ───────────────────────────────────────────────────────
function PlayerSearchCard({
  allPlayers, playerFilter, onFilter,
}: { allPlayers: string[]; playerFilter: string; onFilter: (v: string) => void }) {
  const [input, setInput] = useState(playerFilter);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Keep input in sync when filter is cleared externally
  useEffect(() => { setInput(playerFilter); }, [playerFilter]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const query = input.trim().toLowerCase();
  const suggestions = query.length > 0
    ? allPlayers.filter(p => p.toLowerCase().includes(query))
    : allPlayers;

  function apply(name: string) {
    setInput(name);
    onFilter(name);
    setOpen(false);
  }

  function clear() {
    setInput('');
    onFilter('');
    setOpen(false);
  }

  return (
    <div className="bs-card p-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Search size={16} className="text-amber-400 shrink-0" />
        <span className="text-sm font-bold text-amber-300 shrink-0">Player Search</span>
        <div className="relative flex-1 min-w-[200px]" ref={ref}>
          <input
            type="text"
            placeholder="Type a player name…"
            value={input}
            autoComplete="off"
            onChange={e => {
              setInput(e.target.value);
              onFilter(e.target.value.trim()); // real-time filter
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={e => {
              if (e.key === 'Escape') { setOpen(false); }
              if (e.key === 'Enter' && input.trim()) { apply(input.trim()); }
            }}
            className="w-full text-sm rounded-lg px-3 py-2 border border-amber-800/30 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-8"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#f0edd6' }}
          />
          {input && (
            <button
              onClick={clear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-300"
            >
              <X size={14} />
            </button>
          )}
          {/* Autocomplete dropdown */}
          {open && suggestions.length > 0 && (
            <div
              className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-amber-800/40 shadow-xl overflow-hidden"
              style={{ background: 'rgba(8,20,12,0.97)', backdropFilter: 'blur(16px)' }}
            >
              {!query && (
                <div className="px-3 py-1.5 text-xs text-amber-400/50 border-b border-amber-900/30">
                  All players — click to filter
                </div>
              )}
              {suggestions.map(p => (
                <button
                  key={p}
                  onMouseDown={() => apply(p)}
                  className="w-full text-left px-4 py-2.5 text-sm text-amber-100 hover:bg-amber-700/30 transition-colors flex items-center gap-2"
                >
                  <Search size={11} className="text-amber-500/50" />
                  {/* Highlight matching part */}
                  {query ? (
                    <span>
                      {p.split(new RegExp(`(${query})`, 'gi')).map((part, i) =>
                        part.toLowerCase() === query
                          ? <mark key={i} style={{ background: 'rgba(212,175,55,0.35)', color: '#FFE066', borderRadius: '2px', padding: '0 2px' }}>{part}</mark>
                          : <span key={i}>{part}</span>
                      )}
                    </span>
                  ) : p}
                </button>
              ))}
            </div>
          )}
        </div>

        {playerFilter && (
          <span className="text-sm text-amber-200/60">
            Showing matches for{' '}
            <span className="text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-700/30">{playerFilter}</span>
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Scene removed (Court.png background is used instead) ──────────────────
function BadmintonScene() { return null; }

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function FixtureGenerator() {
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [playerFilter, setPlayerFilter] = useState('');

  const refreshStats = useCallback(async (id: string) => {
    try { setStats(await fixturesApi.getStats(id)); } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (fixture?.id) refreshStats(fixture.id);
  }, [fixture?.id, refreshStats]);

  async function handleCreate(payload: CreateFixturePayload) {
    setLoading(true); setError(null);
    try {
      const f = await fixturesApi.create(payload);
      setFixture(f);
      setActiveTab('schedule');
      setPlayerFilter('');
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Failed to create fixture. Is the backend running on port 3001?');
    } finally { setLoading(false); }
  }

  async function handleResult(matchId: string, result: MatchResult) {
    if (!fixture) return;
    try {
      const updated = await fixturesApi.updateMatch(fixture.id, matchId, result);
      setFixture(prev => {
        if (!prev) return prev;
        const rounds = prev.rounds.map(r => ({
          ...r,
          matches: r.matches.map(m =>
            m.id === matchId ? { ...m, result, status: updated.status } : m
          ),
        }));
        return { ...prev, rounds, progress: updated.progress };
      });
      refreshStats(fixture.id);
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Failed to update result. Check API connection.');
    }
  }

  async function handleScore(matchId: string, scoreA: string, scoreB: string) {
    if (!fixture) return;
    const match = fixture.rounds.flatMap(r => r.matches).find(m => m.id === matchId);
    if (!match || match.result === null) return;
    try {
      await fixturesApi.updateMatch(fixture.id, matchId, match.result, scoreA, scoreB);
      setFixture(prev => {
        if (!prev) return prev;
        const rounds = prev.rounds.map(r => ({
          ...r,
          matches: r.matches.map(m => m.id === matchId ? { ...m, scoreA, scoreB } : m),
        }));
        return { ...prev, rounds };
      });
    } catch { /* silent */ }
  }

  async function handleFinish() {
    if (!fixture) return;
    if (!confirm('Mark fixture as FINISHED? This will lock all results.')) return;
    setFinishing(true);
    try {
      const f = await fixturesApi.finish(fixture.id);
      setFixture(f);
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Failed to finish fixture');
    } finally { setFinishing(false); }
  }

  function handleReset() {
    if (!confirm('Start a new fixture? Current view will be cleared.')) return;
    setFixture(null);
    setStats(null);
  }

  const pendingCount = fixture?.rounds.flatMap(r => r.matches).filter(m => m.status === 'pending').length ?? 0;
  const allDone = fixture ? fixture.progress.pct === 100 : false;

  return (
    <div className="min-h-screen relative">
      <BadmintonScene />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="bs-header sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-2 relative flex items-center justify-center min-h-[80px]">
          {/* Centred brand — absolutely positioned so right-side controls don't shift it */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <BrandLogo />
          </div>
          {/* Right-side fixture controls */}
          {fixture && (
            <div className="ml-auto flex items-center gap-2 relative z-10">
              <span className="hidden sm:block text-sm text-slate-400 border-l border-slate-700 pl-3">
                {fixture.teamAName} <span className="text-slate-600">vs</span> {fixture.teamBName}
              </span>
              {!fixture.isFinished && allDone && (
                <button onClick={handleFinish} disabled={finishing}
                  className="bs-btn-gold flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm disabled:opacity-40">
                  <Trophy size={14} /> {finishing ? 'Finishing…' : 'Mark Finished'}
                </button>
              )}
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-800/40 text-sm text-amber-300/80 hover:bg-white/5 transition-colors">
                <RefreshCw size={13} /> New
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {error && (
          <div className="mb-4 p-3 bg-red-900/80 border border-red-600/50 rounded-lg text-sm text-red-200">{error}</div>
        )}

        {/* ── STEP 1: Team Input ────────────────────────────────────────── */}
        {!fixture && (
          <div className="bs-card max-w-4xl mx-auto">
            <TeamInput onSubmit={handleCreate} loading={loading} />
          </div>
        )}

        {/* ── STEP 2: Fixture View ──────────────────────────────────────── */}
        {fixture && (
          <div className="max-w-6xl mx-auto">
            {/* Team Scoreboard */}
            <TeamScoreBoard
              teamAName={fixture.teamAName}
              teamBName={fixture.teamBName}
              teamStats={stats?.teamStats}
              progress={fixture.progress}
            />

            {/* Progress + Tabs bar */}
            <div className="bs-card px-4 pt-3 pb-0 mb-4">
              <ProgressBanner
                progress={fixture.progress}
                teamAName={fixture.teamAName}
                teamBName={fixture.teamBName}
                matchesPerPlayer={fixture.summary.matchesPerPlayer}
              />
              <div className="flex border-t border-amber-900/20 mt-3">
                <button onClick={() => setActiveTab('schedule')}
                  className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'schedule'
                      ? 'border-amber-400 text-amber-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <Calendar size={15} /> Schedule
                </button>
                <button onClick={() => setActiveTab('stats')}
                  className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'stats'
                      ? 'border-amber-400 text-amber-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <BarChart2 size={15} /> Stats &amp; Charts
                </button>
              </div>
            </div>

            {/* ── Schedule Tab ─────────────────────────────────────────── */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">

                {/* ── Player Search Card ────────────────────────────────── */}
                <PlayerSearchCard
                  allPlayers={[...fixture.teamAPlayers, ...fixture.teamBPlayers]}
                  playerFilter={playerFilter}
                  onFilter={setPlayerFilter}
                />

                {/* ── Status Filter ─────────────────────────────────────── */}
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'completed'] as StatusFilter[]).map(f => (
                    <button key={f} onClick={() => setStatusFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        statusFilter === f
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'border-amber-800/40 text-amber-300/70 hover:border-amber-500 hover:bg-white/5'
                      }`}>
                      {f === 'all' ? `All (${fixture.progress.total})` :
                       f === 'pending' ? `⏳ Pending (${pendingCount})` :
                       `✅ Done (${fixture.progress.completed})`}
                    </button>
                  ))}
                </div>

                {/* ── All Matches — Full Width ──────────────────────────── */}
                <div className="bs-card overflow-hidden">
                  <AllMatchesList
                    rounds={fixture.rounds}
                    teamAName={fixture.teamAName}
                    teamBName={fixture.teamBName}
                    playerFilter={playerFilter}
                    statusFilter={statusFilter}
                    onResult={handleResult}
                    onScore={handleScore}
                    isFinished={fixture.isFinished}
                  />
                </div>
              </div>
            )}

            {/* ── Stats Tab ────────────────────────────────────────────── */}
            {activeTab === 'stats' && stats && (
              <div className="bs-card p-4">
                <StatsPanel
                  stats={stats}
                  teamAName={fixture.teamAName}
                  teamBName={fixture.teamBName}
                  totalRounds={fixture.rounds.length}
                />
              </div>
            )}
            {activeTab === 'stats' && !stats && (
              <p className="text-center text-amber-200/40 py-10">Loading stats…</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


