import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fixturesApi } from '../api/fixturesApi';
import { championshipsApi } from '../api/championshipsApi';
import type { ChampionshipSummary } from '../types/championship';
import TeamInput from '../components/TeamInput';
import AllMatchesList from '../components/AllMatchesList';
import StatsPanel from '../components/StatsPanel';
import TeamScoreBoard from '../components/TeamScoreBoard';
import { exportScheduleCsv, exportPendingCsv, exportStatsCsv } from '../services/exportService';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';
import type {
  Fixture, CreateFixturePayload, MatchResult, MatchStatus, StatsResponse, StatusFilter, TournamentSummary,
} from '../types';
import { BarChart2, Calendar, ArrowLeft, Search, Trophy, X, Download, Upload, CloudUpload, CheckCircle2, Printer, Trash2, FileSpreadsheet, ClipboardList, ShieldCheck, LogOut, Lock, Plus, ChevronRight } from 'lucide-react';

type Tab = 'schedule' | 'stats';
type View = 'home' | 'create' | 'fixture';

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

// ─── Single autocomplete input ────────────────────────────────────────────────
function PlayerInput({
  value, onChange, onSelect, onClear,
  placeholder, allPlayers, excludePlayer, label, accentColor,
}: {
  value: string; onChange: (v: string) => void; onSelect: (v: string) => void; onClear: () => void;
  placeholder: string; allPlayers: string[]; excludePlayer: string;
  label: string; accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = value.trim().toLowerCase();
  const suggestions = allPlayers
    .filter(p => p !== excludePlayer)
    .filter(p => q ? p.toLowerCase().includes(q) : true);

  return (
    <div className="flex-1 min-w-[88px]" ref={ref}>
      <span className="block text-[10px] font-bold mb-0.5 tracking-wide truncate" style={{ color: accentColor }}>{label}</span>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'Enter' && value.trim()) { onSelect(value.trim()); setOpen(false); }
          }}
          className="w-full text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-2 pr-6"
          style={{
            background: 'rgba(255,255,255,0.08)', color: '#f0edd6',
            borderColor: value ? accentColor + '60' : 'rgba(212,175,55,0.25)',
            boxShadow: value ? `0 0 8px ${accentColor}20` : 'none',
          }}
        />
        {value && (
          <button onClick={onClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400/50 hover:text-amber-300">
            <X size={13} />
          </button>
        )}
        {open && suggestions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-amber-800/40 shadow-xl overflow-hidden"
            style={{ background: 'rgba(8,20,12,0.97)', backdropFilter: 'blur(16px)' }}>
            {suggestions.map(p => {
              const parts = q ? p.split(new RegExp(`(${q})`, 'gi')) : [p];
              return (
                <button key={p} onMouseDown={() => { onSelect(p); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-amber-100 hover:bg-amber-700/30 transition-colors flex items-center gap-2">
                  <Search size={11} className="text-amber-500/50 shrink-0" />
                  <span>
                    {parts.map((part, i) =>
                      part.toLowerCase() === q
                        ? <mark key={i} style={{ background: 'rgba(212,175,55,0.35)', color: '#FFE066', borderRadius: '2px', padding: '0 2px' }}>{part}</mark>
                        : <span key={i}>{part}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Match Search Card — find a match by Team A side and/or Team B side ────────
function MatchSearchCard({
  teamAName, teamBName, teamAColor, teamBColor, teamAPlayers, teamBPlayers, searchA, searchB, setSearchA, setSearchB,
}: {
  teamAName: string; teamBName: string; teamAColor: string; teamBColor: string;
  teamAPlayers: string[]; teamBPlayers: string[];
  searchA: [string, string]; searchB: [string, string];
  setSearchA: (v: [string, string]) => void;
  setSearchB: (v: [string, string]) => void;
}) {
  const aActive = searchA.some(Boolean);
  const bActive = searchB.some(Boolean);
  const active = aActive || bActive;

  // Mode hint
  const mode = aActive && bActive ? 'both' : active ? 'one' : 'none';

  const setA = (i: 0 | 1, v: string) => setSearchA(i === 0 ? [v, searchA[1]] : [searchA[0], v]);
  const setB = (i: 0 | 1, v: string) => setSearchB(i === 0 ? [v, searchB[1]] : [searchB[0], v]);

  return (
    <div className="bs-card p-3 sm:p-4">
      {/* Title row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Search size={14} className="text-amber-400 shrink-0" />
        <span className="text-xs sm:text-sm font-bold text-amber-300">Match Search</span>
        {mode === 'both' && (
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(212,175,55,0.18)', color: '#FFE066', border: '1px solid rgba(212,175,55,0.35)' }}>
            🎯 Pinpointing the {teamAName} vs {teamBName} match-up
          </span>
        )}
        {mode === 'one' && (
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(100,180,255,0.12)', color: '#99CCFF', border: '1px solid rgba(100,180,255,0.25)' }}>
            👤 Showing every match for {aActive ? teamAName : teamBName} player(s)
          </span>
        )}
        {active && (
          <button
            onClick={() => { setSearchA(['', '']); setSearchB(['', '']); }}
            className="ml-auto flex items-center gap-1 text-xs text-amber-400/50 hover:text-amber-300 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={11} /> Clear all
          </button>
        )}
      </div>

      {/* Two team sides, each with up to two player inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
        {/* Team A side */}
        <div className="rounded-xl p-2.5" style={{ border: `1px solid ${teamAColor}4D`, background: `${teamAColor}0D` }}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: teamAColor, boxShadow: `0 0 6px ${teamAColor}` }} />
            <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: teamAColor }}>{teamAName}</span>
          </div>
          <div className="flex gap-2">
            <PlayerInput
              label="Player 1" placeholder="Search…" value={searchA[0]}
              allPlayers={teamAPlayers} excludePlayer={searchA[1]} accentColor={teamAColor}
              onChange={v => setA(0, v)} onSelect={v => setA(0, v)} onClear={() => setA(0, '')}
            />
            <PlayerInput
              label="Player 2 (optional)" placeholder="Search…" value={searchA[1]}
              allPlayers={teamAPlayers} excludePlayer={searchA[0]} accentColor={teamAColor}
              onChange={v => setA(1, v)} onSelect={v => setA(1, v)} onClear={() => setA(1, '')}
            />
          </div>
        </div>

        {/* vs divider */}
        <div className="hidden sm:flex items-center justify-center">
          <span className="text-xs font-black text-amber-500/50 tracking-widest">VS</span>
        </div>

        {/* Team B side */}
        <div className="rounded-xl p-2.5" style={{ border: `1px solid ${teamBColor}4D`, background: `${teamBColor}0D` }}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: teamBColor, boxShadow: `0 0 6px ${teamBColor}` }} />
            <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: teamBColor }}>{teamBName}</span>
          </div>
          <div className="flex gap-2">
            <PlayerInput
              label="Player 1" placeholder="Search…" value={searchB[0]}
              allPlayers={teamBPlayers} excludePlayer={searchB[1]} accentColor={teamBColor}
              onChange={v => setB(0, v)} onSelect={v => setB(0, v)} onClear={() => setB(0, '')}
            />
            <PlayerInput
              label="Player 2 (optional)" placeholder="Search…" value={searchB[1]}
              allPlayers={teamBPlayers} excludePlayer={searchB[0]} accentColor={teamBColor}
              onChange={v => setB(1, v)} onSelect={v => setB(1, v)} onClear={() => setB(1, '')}
            />
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-[11px] text-slate-400">
        Search either team to list all their matches, or both teams to jump straight to that match-up.
      </p>
    </div>
  );
}

// ─── Scene removed (Court.png background is used instead) ──────────────────
function BadmintonScene() { return null; }

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function FixtureGenerator() {
  const { isAdmin, loading: authLoading, user, logout, isDev, devAdmin, setDevAdmin } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [view, setView] = useState<View>('home');
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [championships, setChampionships] = useState<ChampionshipSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteMatchFlash, setDeleteMatchFlash] = useState<string | null>(null);
  const [dirtyMatchIds, setDirtyMatchIds] = useState<string[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [matchFilter, setMatchFilter] = useState('');
  // Team-aware search: up to two players per team side.
  const [searchA, setSearchA] = useState<[string, string]>(['', '']);
  const [searchB, setSearchB] = useState<[string, string]>(['', '']);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const [t, c] = await Promise.allSettled([fixturesApi.list(), championshipsApi.list()]);
    if (t.status === 'fulfilled') setTournaments(t.value);
    if (c.status === 'fulfilled') setChampionships(c.value);
    setHistoryLoading(false);
  }, []);

  // Load history on first mount
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const refreshStats = useCallback(async (id: string) => {
    try { setStats(await fixturesApi.getStats(id)); } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (fixture?.id) refreshStats(fixture.id);
  }, [fixture?.id, refreshStats]);

  // ─── Real-time updates for read-only viewers ───────────────────────────────
  // Admins drive the UI via instant local recompute (their own optimistic edits),
  // so we only subscribe for viewers — their scoreboard/stats then auto-update
  // within ~1s of an admin syncing, with no page reload.
  const fixtureId = fixture?.id;
  useEffect(() => {
    if (!fixtureId || isAdmin) return;
    const unsub = fixturesApi.subscribeFixture(fixtureId, (f, s) => {
      setFixture(f);
      setStats(s);
    });
    return () => unsub();
  }, [fixtureId, isAdmin]);

  async function handleCreate(payload: CreateFixturePayload) {
    setLoading(true); setError(null);
    try {
      // Generate locally — NOT yet saved to Firestore
      const f = fixturesApi.preview(payload);
      setFixture(f);
      setIsSaved(false);
      setSaveSuccess(false);
      setDirtyMatchIds([]);
      setActiveTab('schedule');
      setSearchA(['', '']);
      setSearchB(['', '']);
      setMatchFilter('');
      setView('fixture');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to generate fixture.');
    } finally { setLoading(false); }
  }

  function handlePrint() {
    window.print();
  }

  async function handleSave() {
    if (!fixture) return;
    if (isSaved && dirtyMatchIds.length === 0) return;
    setSaving(true);
    try {
      await fixturesApi.syncDirtyMatches(fixture, dirtyMatchIds);
      setIsSaved(true);
      setDirtyMatchIds([]);
      setSaveSuccess(true);
      loadHistory();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      alert(e?.message ?? 'Sync failed. Check your Firebase connection.');
    } finally { setSaving(false); }
  }

  // ─── Track which matches were changed locally (not yet synced) ───
  function markDirty(matchId: string) {
    setDirtyMatchIds(prev => prev.includes(matchId) ? prev : [...prev, matchId]);
  }


  async function handleOpenTournament(id: string) {
    setLoading(true); setError(null);
    try {
      const f = await fixturesApi.get(id);
      setFixture(f);
      setIsSaved(true);
      setDirtyMatchIds([]);
      setSaveSuccess(false);
      setActiveTab('schedule');
      setSearchA(['', '']);
      setSearchB(['', '']);
      setStatusFilter('all');
      setMatchFilter('');
      setView('fixture');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load tournament.');
    } finally { setLoading(false); }
  }

  async function handleDeleteMatch(matchId: string) {
    if (!fixture) return;
    if (!confirm('Remove this match from the schedule? This cannot be undone.')) return;

    // 1. Remove from local UI immediately (optimistic)
    setFixture(prev => {
      if (!prev) return prev;
      const rounds = prev.rounds.map(r => ({
        ...r,
        matches: r.matches.filter(m => m.id !== matchId),
      })).filter(r => r.matches.length > 0);
      return { ...prev, rounds };
    });
    // Remove from dirty list — no need to sync a deleted match
    setDirtyMatchIds(prev => prev.filter(id => id !== matchId));

    // 2. Always attempt Firestore delete — it's a no-op if the match was never saved.
    //    This ensures cloud data stays in sync whether the fixture was just saved or
    //    loaded from history.
    try {
      await fixturesApi.deleteMatch(matchId);
      if (isSaved) {
        setDeleteMatchFlash('Match removed from cloud.');
        setTimeout(() => setDeleteMatchFlash(null), 2500);
      }
    } catch (e: any) {
      // Cloud delete failed — local removal already happened, warn the user
      setError(`Match removed locally but cloud sync failed: ${e?.message ?? 'unknown error'}. Press "Save & Sync" to retry.`);
    }
  }

  async function handleDeleteTournament(id: string, name: string) {
    if (!confirm(`Delete "${name}"? All match data will be permanently removed.`)) return;
    // Optimistically remove from the dashboard list immediately
    setTournaments(prev => prev.filter(t => t.id !== id));
    try {
      await fixturesApi.delete(id);
      // If we're currently viewing this tournament, navigate back to home
      if (fixture?.id === id) {
        setFixture(null);
        setStats(null);
        setIsSaved(false);
        setDirtyMatchIds([]);
        setView('home');
      }
    } catch (e: any) {
      // Restore the list so the user can retry
      await loadHistory();
      setError(`Failed to delete "${name}" from cloud: ${e?.message ?? 'unknown error'}. Check your connection and try again.`);
    }
  }

  function handleBackToHistory() {
    const unsaved = !isSaved || dirtyMatchIds.length > 0;
    if (unsaved && fixture) {
      const msg = !isSaved
        ? 'This fixture has not been saved to the cloud yet. Discard it?'
        : `You have ${dirtyMatchIds.length} unsynced change(s). Leave without syncing?`;
      if (!confirm(msg)) return;
    }
    setFixture(null);
    setStats(null);
    setError(null);
    setIsSaved(false);
    setSaveSuccess(false);
    setDirtyMatchIds([]);
    setSearchA(['', '']);
    setSearchB(['', '']);
    setMatchFilter('');
    setView('home');
    loadHistory();
  }

  // ─── Export all data as JSON download ─────────────────────────────
  async function handleExport() {
    try {
      const json = await fixturesApi.exportAll();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badminton-starz-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message ?? 'Export failed');
    }
  }

  // ─── Import data from JSON backup file ────────────────────────────
  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const count = await fixturesApi.importAll(text);
        await loadHistory();
        alert(`✅ Restored ${count} tournament${count !== 1 ? 's' : ''} successfully!`);
      } catch (err: any) {
        alert(`❌ Import failed: ${err?.message ?? 'Unknown error'}`);
      }
    };
    input.click();
  }

  async function handleResult(matchId: string, result: MatchResult) {
    if (!fixture) return;
    const newStatus: MatchStatus = result === null ? 'pending' : result === 'not_played' ? 'not_played' : 'completed';
    // Build the updated fixture, then recompute progress + stats LOCALLY (no
    // network) so the scoreboard and charts update instantly.
    const rounds = fixture.rounds.map(r => ({
      ...r,
      matches: r.matches.map(m => m.id === matchId ? { ...m, result, status: newStatus } : m),
    }));
    const updated: Fixture = { ...fixture, rounds };
    updated.progress = fixturesApi.localProgress(updated);
    setFixture(updated);
    setStats(fixturesApi.localStats(updated));
    // Mark as dirty — will be synced to the cloud when the admin clicks Sync.
    markDirty(matchId);
  }

  async function handleScore(matchId: string, scoreA: string, scoreB: string) {
    if (!fixture) return;
    const match = fixture.rounds.flatMap(r => r.matches).find(m => m.id === matchId);
    if (!match || match.result === null) return;
    // Update local state immediately
    setFixture(prev => {
      if (!prev) return prev;
      const rounds = prev.rounds.map(r => ({
        ...r,
        matches: r.matches.map(m => m.id === matchId ? { ...m, scoreA, scoreB } : m),
      }));
      return { ...prev, rounds };
    });
    // Mark as dirty — will be synced when user clicks Sync
    markDirty(matchId);
  }

  async function handleFinish() {
    if (!fixture) return;
    if (!confirm('Mark fixture as FINISHED? This will lock all results.')) return;
    setFinishing(true);
    try {
      // Sync any pending dirty changes before finishing
      if (!isSaved || dirtyMatchIds.length > 0) {
        await fixturesApi.syncDirtyMatches(fixture, dirtyMatchIds);
        setIsSaved(true);
        setDirtyMatchIds([]);
      }
      const f = await fixturesApi.finish(fixture.id);
      setFixture(f);
      loadHistory();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Failed to finish fixture');
    } finally { setFinishing(false); }
  }

  const pendingCount = fixture?.rounds.flatMap(r => r.matches).filter(m => m.status === 'pending').length ?? 0;
  const allDone = fixture ? fixture.progress.pct === 100 : false;

  // Unified dashboard list — championships + round-robin fixtures, newest first.
  const dashItems = [
    ...championships.map(c => ({
      kind: 'championship' as const, id: c.id, name: c.name, createdAt: c.createdAt,
      sub: `${c.eventCount} event${c.eventCount !== 1 ? 's' : ''}`,
    })),
    ...tournaments.map(t => ({
      kind: 'fixture' as const, id: t.id, name: t.tournamentName, createdAt: t.createdAt,
      sub: `${t.teamAName} vs ${t.teamBName}`,
      pct: t.pct, isFinished: t.isFinished, completedMatches: t.completedMatches, totalMatches: t.totalMatches,
    })),
  ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div className="min-h-screen relative">
      <BadmintonScene />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="bs-header sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 relative flex items-center justify-center min-h-[56px] sm:min-h-[80px]">
          <div className="absolute left-1/2 -translate-x-1/2">
            <BrandLogo />
          </div>

          {view === 'fixture' && (
            <button
              onClick={handleBackToHistory}
              className="absolute left-2 sm:left-4 flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg border border-amber-800/40 text-xs sm:text-sm text-amber-300/80 hover:bg-white/5 transition-colors z-10">
              <ArrowLeft size={13} /> Back
            </button>
          )}
          {view === 'fixture' && fixture && isAdmin && isSaved && !fixture.isFinished && allDone && (
            <button onClick={handleFinish} disabled={finishing}
              className="absolute right-2 sm:right-4 bs-btn-gold flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm disabled:opacity-40 z-10">
              <Trophy size={13} /> {finishing ? 'Finishing…' : 'Finish'}
            </button>
          )}
          {view === 'fixture' && fixture && (
            <button
              onClick={handlePrint}
              className="bs-no-print absolute right-2 sm:right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-800/40 text-xs text-amber-300/70 hover:text-amber-200 hover:border-amber-500/60 hover:bg-white/5 transition-colors z-10"
              style={{ right: isAdmin && isSaved && !fixture.isFinished && allDone ? '120px' : undefined }}
              title="Print schedule"
            >
              <Printer size={13} /> <span className="hidden sm:inline">Print</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 relative z-10">
        {/* ── Persistent ADMIN status banner (all views when signed in) ────── */}
        {!authLoading && isAdmin && (
          <div className="bs-no-print mb-3 flex items-center gap-3 px-4 py-2.5 rounded-xl border"
            style={{
              background: 'linear-gradient(90deg, rgba(16,185,129,0.20), rgba(16,185,129,0.06))',
              borderColor: 'rgba(16,185,129,0.55)',
              boxShadow: '0 0 18px rgba(16,185,129,0.20)',
            }}>
            <ShieldCheck size={18} className="text-emerald-300 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black tracking-wide" style={{ color: '#6EE7B7' }}>
                You're signed in as ADMIN
              </p>
              <p className="text-xs truncate" style={{ color: 'rgba(110,231,183,0.65)' }}>
                {user?.email ? `${user.email} · ` : ''}create, edit &amp; score enabled
              </p>
            </div>
            <button onClick={logout}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-700/50 text-xs font-bold text-emerald-200/90 hover:text-emerald-100 hover:bg-emerald-900/25 transition-colors">
              <LogOut size={12} /> Sign out
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/80 border border-red-600/50 rounded-lg text-sm text-red-200">{error}</div>
        )}

        {/* ── VIEW: Home — Unified Dashboard ─────────────────────────────── */}
        {view === 'home' && (
          <div className="max-w-3xl mx-auto">
            {/* Admin sign-in (viewers only — admins see the status banner above) */}
            {!authLoading && !isAdmin && (
              <div className="flex justify-center mb-6">
                <button onClick={() => setLoginOpen(true)}
                  className="bs-card flex items-center gap-2 px-5 py-2.5 text-sm font-bold hover:scale-[1.02] transition-transform"
                  style={{ color: '#FFE066' }}>
                  <Lock size={14} className="text-amber-400" /> Admin sign in
                  <span className="hidden sm:inline text-xs font-normal text-amber-200/40">· everyone else is read-only</span>
                </button>
              </div>
            )}

            {/* Admin: create actions */}
            {isAdmin && (
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <button onClick={() => setView('create')} className="bs-btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
                  <Plus size={15} /> New Round-Robin Fixture
                </button>
                <button onClick={() => navigate('/championships?create=1')} className="bs-btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
                  <Trophy size={15} /> New Championship
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.2)' }} />
              <span className="text-xs font-bold text-amber-300/60 uppercase tracking-widest">Select a tournament to view</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.2)' }} />
            </div>

            {/* Combined list — championships + round-robin fixtures */}
            {historyLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', height: '72px' }} />)}
              </div>
            ) : dashItems.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-amber-900/30" style={{ background: 'rgba(8,25,12,0.35)' }}>
                <Trophy size={26} className="text-amber-400/30 mx-auto mb-2" />
                <p className="text-sm text-amber-200/40">Nothing here yet.</p>
                {isAdmin
                  ? <p className="text-xs text-amber-200/25 mt-1">Create a round-robin fixture or a championship above.</p>
                  : <p className="text-xs text-amber-200/25 mt-1">An admin can create tournaments.</p>}
              </div>
            ) : (
              <div className="space-y-2">
                {dashItems.map(item => item.kind === 'fixture' ? (
                  <button key={'f' + item.id} onClick={() => handleOpenTournament(item.id)}
                    className="w-full bs-card flex items-center gap-3 px-4 py-3 text-left hover:scale-[1.01] transition-transform">
                    <span className="shrink-0 text-[10px] font-black px-2 py-1 rounded-md" style={{ background: 'rgba(0,191,255,0.15)', color: '#7FE0FF', border: '1px solid rgba(0,191,255,0.4)' }}>
                      ROUND ROBIN
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm truncate" style={{ color: 'var(--text)' }}>{item.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.sub} · {item.completedMatches}/{item.totalMatches} matches · {item.pct}%</div>
                    </div>
                    <span className="hidden sm:inline shrink-0 text-[10px] font-bold" style={{ color: item.isFinished ? '#FFD700' : '#00BFFF' }}>
                      {item.isFinished ? '🏆 Finished' : item.completedMatches === 0 ? '🆕 New' : '⏳ Ongoing'}
                    </span>
                    <ChevronRight size={16} className="text-amber-400/40 shrink-0" />
                  </button>
                ) : (
                  <button key={'c' + item.id} onClick={() => navigate('/championships?open=' + item.id)}
                    className="w-full bs-card flex items-center gap-3 px-4 py-3 text-left hover:scale-[1.01] transition-transform">
                    <span className="shrink-0 text-[10px] font-black px-2 py-1 rounded-md" style={{ background: 'rgba(255,215,0,0.15)', color: '#FFE066', border: '1px solid rgba(255,215,0,0.4)' }}>
                      CHAMPIONSHIP
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm truncate" style={{ color: 'var(--text)' }}>{item.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.sub}</div>
                    </div>
                    <Trophy size={15} className="text-amber-400 shrink-0" />
                    <ChevronRight size={16} className="text-amber-400/40 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Admin backup footer */}
            {isAdmin && (
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <span className="text-xs text-amber-200/30">Data backup:</span>
                <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-800/30 text-xs text-amber-300/60 hover:text-amber-300 hover:border-amber-600/50 hover:bg-white/5 transition-colors">
                  <Download size={12} /> Export backup
                </button>
                <button onClick={handleImport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-800/30 text-xs text-amber-300/60 hover:text-amber-300 hover:border-amber-600/50 hover:bg-white/5 transition-colors">
                  <Upload size={12} /> Restore from backup
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW: Create (admin) — Round-Robin fixture form ────────────── */}
        {view === 'create' && isAdmin && (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setView('home')} className="mb-3 flex items-center gap-1 text-xs text-amber-300/70 hover:text-amber-200">
              <ArrowLeft size={13} /> Dashboard
            </button>
            <div className="bs-card">
              <TeamInput onSubmit={handleCreate} loading={loading} />
            </div>
          </div>
        )}

        {/* ── VIEW: Fixture ─────────────────────────────────────────────── */}
        {view === 'fixture' && fixture && (
          <div id="bs-print-area" className="max-w-6xl mx-auto">

            {/* ── Save / Sync banner ────────────────────────────────────────── */}
            {isAdmin && (!isSaved || dirtyMatchIds.length > 0) && !saveSuccess && (
              <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: 'rgba(212,130,0,0.15)', borderColor: 'rgba(212,130,0,0.45)' }}>
                <CloudUpload size={16} className="text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  {!isSaved ? (
                    <>
                      <p className="text-sm font-bold text-amber-300">Not saved to cloud yet</p>
                      <p className="text-xs text-amber-200/60">All changes are local. Click Sync to save to Firestore.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-amber-300">
                        {dirtyMatchIds.length} match{dirtyMatchIds.length !== 1 ? 'es' : ''} changed locally
                      </p>
                      <p className="text-xs text-amber-200/60">Only these {dirtyMatchIds.length} record{dirtyMatchIds.length !== 1 ? 's' : ''} will be written to Firestore — not the full fixture.</p>
                    </>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-sm transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#d4af37,#b8860b)', color: '#0a0a0a', boxShadow: '0 0 12px rgba(212,175,55,0.4)' }}
                >
                  <CloudUpload size={13} />
                  {saving
                    ? 'Syncing…'
                    : !isSaved
                      ? 'Save & Sync All'
                      : `Sync ${dirtyMatchIds.length} Change${dirtyMatchIds.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            )}

            {/* ── Save success flash ────────────────────────────────────────── */}
            {saveSuccess && (
              <div className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border"
                style={{ background: 'rgba(0,200,80,0.12)', borderColor: 'rgba(0,200,80,0.35)' }}>
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span className="text-sm font-bold text-emerald-300">Saved & synced to Firestore!</span>
              </div>
            )}

            {/* ── Delete match flash ───────────────────────────────────────── */}
            {deleteMatchFlash && (
              <div className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border"
                style={{ background: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.30)' }}>
                <Trash2 size={14} className="text-red-400 shrink-0" />
                <span className="text-sm font-bold text-red-300">{deleteMatchFlash}</span>
              </div>
            )}

            {/* ── Combined scoreboard card: header + live score + tabs ──────── */}
            <TeamScoreBoard
              tournamentName={fixture.tournamentName}
              teamAName={fixture.teamAName}
              teamBName={fixture.teamBName}
              teamAColor={fixture.teamAColor}
              teamBColor={fixture.teamBColor}
              teamStats={stats?.teamStats}
              progress={fixture.progress}
              isFinished={fixture.isFinished}
              canDelete={isAdmin && isSaved}
              onDelete={() => handleDeleteTournament(fixture.id, fixture.tournamentName)}
            >
              <button onClick={() => setActiveTab('schedule')}
                className={`bs-tab ${activeTab === 'schedule' ? 'bs-tab-active' : ''}`}>
                <Calendar size={16} /> Schedule
              </button>
              <button onClick={() => setActiveTab('stats')}
                className={`bs-tab ${activeTab === 'stats' ? 'bs-tab-active' : ''}`}>
                <BarChart2 size={16} /> Stats &amp; Charts
              </button>
            </TeamScoreBoard>

            {/* ── Schedule Tab ─────────────────────────────────────────── */}
            {activeTab === 'schedule' && (
              <div className="space-y-3">
                <MatchSearchCard
                  teamAName={fixture.teamAName}
                  teamBName={fixture.teamBName}
                  teamAColor={fixture.teamAColor}
                  teamBColor={fixture.teamBColor}
                  teamAPlayers={fixture.teamAPlayers}
                  teamBPlayers={fixture.teamBPlayers}
                  searchA={searchA}
                  searchB={searchB}
                  setSearchA={setSearchA}
                  setSearchB={setSearchB}
                />

                {/* ── Status Filter + Match # + Export ──────────────── */}
                <div className="flex gap-2 flex-wrap items-center">
                  {([
                    { f: 'completed', label: `✅ Done (${fixture.progress.completed + fixture.progress.notPlayed})` },
                    { f: 'pending',   label: `⏳ Pending (${pendingCount})` },
                    { f: 'all',       label: `All (${fixture.progress.total})` },
                  ] as { f: StatusFilter; label: string }[]).map(({ f, label }) => (
                    <button key={f} onClick={() => setStatusFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        statusFilter === f
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'border-amber-800/40 text-amber-300/70 hover:border-amber-500 hover:bg-white/5'
                      }`}>
                      {label}
                    </button>
                  ))}

                  {/* Jump to a specific match number */}
                  <div className="relative">
                    <input
                      type="text" inputMode="numeric" value={matchFilter}
                      onChange={e => setMatchFilter(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Match #"
                      className="w-24 text-xs rounded-full pl-3 pr-6 py-1.5 border focus:outline-none focus:ring-1 focus:ring-amber-500"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#f0edd6', borderColor: matchFilter ? 'rgba(212,175,55,0.6)' : 'rgba(212,175,55,0.25)' }}
                    />
                    {matchFilter && (
                      <button onClick={() => setMatchFilter('')} title="Clear match filter"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400/50 hover:text-amber-300">
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Export buttons (hidden when printing) */}
                  <div className="bs-no-print ml-auto flex gap-2">
                    <button
                      onClick={() => exportScheduleCsv(fixture)}
                      title="Download the full schedule as a CSV (opens in Excel)"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-700/40 text-emerald-300/80 hover:text-emerald-200 hover:border-emerald-500/60 hover:bg-emerald-900/15 transition-colors"
                    >
                      <FileSpreadsheet size={13} /> Schedule CSV
                    </button>
                    {pendingCount > 0 && (
                      <button
                        onClick={() => exportPendingCsv(fixture)}
                        title="Download a checklist of all matches not yet played"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-amber-700/40 text-amber-300/80 hover:text-amber-200 hover:border-amber-500/60 hover:bg-amber-900/15 transition-colors"
                      >
                        <ClipboardList size={13} /> Pending Report
                      </button>
                    )}
                  </div>
                </div>

                <div className="bs-card overflow-hidden">
                  <AllMatchesList
                    rounds={fixture.rounds}
                    teamAName={fixture.teamAName}
                    teamBName={fixture.teamBName}
                    teamAColor={fixture.teamAColor}
                    teamBColor={fixture.teamBColor}
                    searchA={searchA}
                    searchB={searchB}
                    statusFilter={statusFilter}
                    matchNumberFilter={matchFilter}
                    onResult={handleResult}
                    onScore={handleScore}
                    onDeleteMatch={handleDeleteMatch}
                    isFinished={fixture.isFinished}
                    canEdit={isAdmin}
                  />
                </div>
              </div>
            )}

            {/* ── Stats Tab ────────────────────────────────────────────── */}
            {activeTab === 'stats' && stats && (
              <div className="bs-card p-4">
                <div className="bs-no-print flex justify-end mb-3">
                  <button
                    onClick={() => exportStatsCsv(fixture, stats)}
                    title="Download points table, pair and player stats as a CSV (opens in Excel)"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-700/40 text-emerald-300/80 hover:text-emerald-200 hover:border-emerald-500/60 hover:bg-emerald-900/15 transition-colors"
                  >
                    <FileSpreadsheet size={13} /> Export Stats CSV
                  </button>
                </div>
                <StatsPanel
                  stats={stats}
                  teamAName={fixture.teamAName}
                  teamBName={fixture.teamBName}
                  teamAColor={fixture.teamAColor}
                  teamBColor={fixture.teamBColor}
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

      {/* ── Admin Login Modal ─────────────────────────────────────────────── */}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

      {/* ── DEV ONLY: admin role toggle (compiled out of production) ──────── */}
      {isDev && (
        <button
          onClick={() => setDevAdmin(!devAdmin)}
          title="Dev-only: toggle the admin role to test both experiences"
          className="bs-no-print fixed bottom-3 left-3 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black shadow-lg transition-colors"
          style={{
            background: devAdmin ? 'linear-gradient(135deg,#d4af37,#b8860b)' : 'rgba(8,22,12,0.95)',
            color: devAdmin ? '#0a0a0a' : '#9ca3af',
            border: `1px solid ${devAdmin ? 'rgba(212,175,55,0.6)' : 'rgba(120,120,120,0.4)'}`,
          }}
        >
          🧪 DEV · {devAdmin ? 'ADMIN' : 'Viewer'}
        </button>
      )}
    </div>
  );
}