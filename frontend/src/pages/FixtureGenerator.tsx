import { useState, useEffect, useCallback, useRef } from 'react';
import { fixturesApi } from '../api/fixturesApi';
import TeamInput from '../components/TeamInput';
import ProgressBanner from '../components/ProgressBanner';
import AllMatchesList from '../components/AllMatchesList';
import StatsPanel from '../components/StatsPanel';
import TeamScoreBoard from '../components/TeamScoreBoard';
import TournamentHistory from '../components/TournamentHistory';
import { exportScheduleCsv, exportPendingCsv, exportStatsCsv } from '../services/exportService';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';
import type {
  Fixture, CreateFixturePayload, MatchResult, StatsResponse, StatusFilter, TournamentSummary,
} from '../types';
import { BarChart2, Calendar, ArrowLeft, Search, Trophy, X, Download, Upload, CloudUpload, CheckCircle2, Printer, Trash2, FileSpreadsheet, ClipboardList, ShieldCheck, LogOut, Lock, Eye } from 'lucide-react';

type Tab = 'schedule' | 'stats';
type View = 'home' | 'fixture';

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
    <div className="flex-1 min-w-[140px]" ref={ref}>
      <span className="block text-[10px] font-bold mb-1 tracking-wide" style={{ color: accentColor }}>{label}</span>
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
          className="w-full text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 pr-7"
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
  teamAName, teamBName, teamAPlayers, teamBPlayers, searchA, searchB, setSearchA, setSearchB,
}: {
  teamAName: string; teamBName: string;
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
        <div className="rounded-xl p-2.5" style={{ border: '1px solid rgba(0,191,255,0.3)', background: 'rgba(0,191,255,0.05)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#00BFFF', boxShadow: '0 0 6px #00BFFF' }} />
            <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: '#00BFFF' }}>{teamAName}</span>
          </div>
          <div className="flex gap-2">
            <PlayerInput
              label="Player 1" placeholder="Search…" value={searchA[0]}
              allPlayers={teamAPlayers} excludePlayer={searchA[1]} accentColor="#00BFFF"
              onChange={v => setA(0, v)} onSelect={v => setA(0, v)} onClear={() => setA(0, '')}
            />
            <PlayerInput
              label="Player 2 (optional)" placeholder="Search…" value={searchA[1]}
              allPlayers={teamAPlayers} excludePlayer={searchA[0]} accentColor="#00BFFF"
              onChange={v => setA(1, v)} onSelect={v => setA(1, v)} onClear={() => setA(1, '')}
            />
          </div>
        </div>

        {/* vs divider */}
        <div className="hidden sm:flex items-center justify-center">
          <span className="text-xs font-black text-amber-500/50 tracking-widest">VS</span>
        </div>

        {/* Team B side */}
        <div className="rounded-xl p-2.5" style={{ border: '1px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.05)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#FFD700', boxShadow: '0 0 6px #FFD700' }} />
            <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: '#FFD700' }}>{teamBName}</span>
          </div>
          <div className="flex gap-2">
            <PlayerInput
              label="Player 1" placeholder="Search…" value={searchB[0]}
              allPlayers={teamBPlayers} excludePlayer={searchB[1]} accentColor="#FFD700"
              onChange={v => setB(0, v)} onSelect={v => setB(0, v)} onClear={() => setB(0, '')}
            />
            <PlayerInput
              label="Player 2 (optional)" placeholder="Search…" value={searchB[1]}
              allPlayers={teamBPlayers} excludePlayer={searchB[0]} accentColor="#FFD700"
              onChange={v => setB(1, v)} onSelect={v => setB(1, v)} onClear={() => setB(1, '')}
            />
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-[11px] text-amber-200/45">
        Search either team to list all their matches, or both teams to jump straight to that match-up — then check its status and start it.
      </p>
    </div>
  );
}

// ─── Scene removed (Court.png background is used instead) ──────────────────
function BadmintonScene() { return null; }

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function FixtureGenerator() {
  const { isAdmin, loading: authLoading, user, logout, isDev, devAdmin, setDevAdmin } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [view, setView] = useState<View>('home');
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteMatchFlash, setDeleteMatchFlash] = useState<string | null>(null);
  const [deletingTournamentId, setDeletingTournamentId] = useState<string | null>(null);
  const [dirtyMatchIds, setDirtyMatchIds] = useState<string[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  // Team-aware search: up to two players per team side.
  const [searchA, setSearchA] = useState<[string, string]>(['', '']);
  const [searchB, setSearchB] = useState<[string, string]>(['', '']);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try { setTournaments(await fixturesApi.list()); } catch { /* silent */ }
    finally { setHistoryLoading(false); }
  }, []);

  // Load history on first mount
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const refreshStats = useCallback(async (id: string) => {
    try { setStats(await fixturesApi.getStats(id)); } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (fixture?.id) refreshStats(fixture.id);
  }, [fixture?.id, refreshStats]);

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


  async function handleStart(matchId: string) {
    if (!fixture) return;
    const currentMatch = fixture.rounds.flatMap(r => r.matches).find(m => m.id === matchId);
    if (!currentMatch) return;
    const newStatus = currentMatch.status === 'in_progress' ? 'pending' : 'in_progress';
    // Update local state immediately
    setFixture(prev => {
      if (!prev) return prev;
      const rounds = prev.rounds.map(r => ({
        ...r,
        matches: r.matches.map(m =>
          m.id === matchId ? { ...m, status: newStatus as import('../types').MatchStatus } : m
        ),
      }));
      return { ...prev, rounds };
    });
    // Mark as dirty — will be synced when user clicks Sync
    markDirty(matchId);
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
      setView('fixture');
      setHistoryPanelOpen(false);
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
    // Mark as deleting — shows spinner on the card
    setDeletingTournamentId(id);
    // Optimistically remove from the history list immediately
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
    } finally {
      setDeletingTournamentId(null);
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
    const newStatus = result === null ? 'pending' : result === 'not_played' ? 'not_played' : 'completed';
    // Update local state immediately
    setFixture(prev => {
      if (!prev) return prev;
      const rounds = prev.rounds.map(r => ({
        ...r,
        matches: r.matches.map(m =>
          m.id === matchId ? { ...m, result, status: newStatus as import('../types').MatchStatus } : m
        ),
      }));
      return { ...prev, rounds };
    });
    refreshStats(fixture.id);
    // Mark as dirty — will be synced when user clicks Sync
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

  return (
    <div className="min-h-screen relative">
      <BadmintonScene />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="bs-header sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 relative flex items-center justify-center min-h-[56px] sm:min-h-[80px]">
          <div className="absolute left-1/2 -translate-x-1/2">
            <BrandLogo />
          </div>

          {/* Admin auth control (home view) */}
          {view === 'home' && !authLoading && (
            <div className="bs-no-print absolute left-2 sm:left-4 z-10 flex items-center gap-2">
              {isAdmin ? (
                <>
                  <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(212,175,55,0.15)', color: '#FFE066', border: '1px solid rgba(212,175,55,0.4)' }}
                    title={user?.email ?? 'Admin'}>
                    <ShieldCheck size={12} /> Admin
                  </span>
                  <button onClick={logout}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-amber-800/40 text-xs text-amber-300/80 hover:bg-white/5 transition-colors">
                    <LogOut size={12} /> <span className="hidden sm:inline">Sign out</span>
                  </button>
                </>
              ) : (
                <button onClick={() => setLoginOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-800/40 text-xs text-amber-300/80 hover:bg-white/5 transition-colors">
                  <Lock size={12} /> <span className="hidden sm:inline">Admin sign in</span>
                </button>
              )}
            </div>
          )}

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
        {error && (
          <div className="mb-4 p-3 bg-red-900/80 border border-red-600/50 rounded-lg text-sm text-red-200">{error}</div>
        )}

        {/* ── VIEW: Home — Admin (create form) ───────────────────────────── */}
        {view === 'home' && isAdmin && (
          <div className="max-w-4xl mx-auto">
            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.2)' }} />
              <span className="text-xs font-bold text-amber-300/50 uppercase tracking-widest">New Tournament</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.2)' }} />
            </div>

            {/* Create form */}
            <div className="bs-card">
              <TeamInput onSubmit={handleCreate} loading={loading} />
            </div>

            {/* Backup / Restore footer */}
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <span className="text-xs text-amber-200/30">Data backup:</span>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-800/30 text-xs text-amber-300/60 hover:text-amber-300 hover:border-amber-600/50 hover:bg-white/5 transition-colors"
              >
                <Download size={12} /> Export backup
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-800/30 text-xs text-amber-300/60 hover:text-amber-300 hover:border-amber-600/50 hover:bg-white/5 transition-colors"
              >
                <Upload size={12} /> Restore from backup
              </button>
            </div>
          </div>
        )}

        {/* ── VIEW: Home — auth loading ──────────────────────────────────── */}
        {view === 'home' && authLoading && (
          <p className="text-center text-amber-200/40 py-16">Loading…</p>
        )}

        {/* ── VIEW: Home — Viewer (read-only dashboard) ──────────────────── */}
        {view === 'home' && !isAdmin && !authLoading && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.2)' }} />
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300/50 uppercase tracking-widest">
                <Eye size={12} /> Live Tournaments
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.2)' }} />
            </div>

            {!authLoading && (
              <div className="bs-card px-4 py-3 mb-4 flex items-center gap-2 text-xs text-amber-200/60">
                <ShieldCheck size={14} className="text-amber-400 shrink-0" />
                You're viewing in read-only mode. Tap a tournament to see the schedule and live stats.
                <button onClick={() => setLoginOpen(true)} className="ml-auto shrink-0 flex items-center gap-1 text-amber-300 hover:text-amber-200 underline underline-offset-2">
                  <Lock size={11} /> Admin sign in
                </button>
              </div>
            )}

            <div className="bs-card p-3">
              <TournamentHistory
                tournaments={tournaments}
                loading={historyLoading}
                onOpen={handleOpenTournament}
                panelMode
              />
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

            {/* Tournament + teams banner */}
            <div className="bs-card px-4 py-3 mb-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <Trophy size={14} className="text-amber-400 shrink-0" />
                <span className="font-black text-sm text-amber-300 truncate">{fixture.tournamentName}</span>
              </div>
              <div className="flex items-start sm:items-center gap-3 sm:gap-5 flex-wrap sm:ml-auto text-xs">
                <div className="flex flex-col">
                  <span className="font-black" style={{ color: '#00BFFF' }}>{fixture.teamAName}</span>
                  <span style={{ color: 'rgba(0,191,255,0.85)' }}>{fixture.teamAPlayers.join(', ')}</span>
                </div>
                <span className="text-amber-200/25 font-bold hidden sm:block">vs</span>
                <div className="flex flex-col sm:text-right">
                  <span className="font-black" style={{ color: '#FFD700' }}>{fixture.teamBName}</span>
                  <span style={{ color: 'rgba(255,215,0,0.85)' }}>{fixture.teamBPlayers.join(', ')}</span>
                </div>
              </div>
              {/* Delete entire tournament */}
              {isAdmin && isSaved && (
                <button
                  onClick={() => handleDeleteTournament(fixture.id, fixture.tournamentName)}
                  title="Delete this entire tournament"
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-red-800/30 text-red-400/50 hover:text-red-300 hover:border-red-600/50 hover:bg-red-900/15 transition-colors"
                >
                  <Trash2 size={12} /> Delete Tournament
                </button>
              )}
            </div>

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
                  className={`bs-tab ${activeTab === 'schedule' ? 'bs-tab-active' : ''}`}>
                  <Calendar size={16} /> Schedule
                </button>
                <button onClick={() => setActiveTab('stats')}
                  className={`bs-tab ${activeTab === 'stats' ? 'bs-tab-active' : ''}`}>
                  <BarChart2 size={16} /> Stats &amp; Charts
                </button>
              </div>
            </div>

            {/* ── Schedule Tab ─────────────────────────────────────────── */}
            {activeTab === 'schedule' && (
              <div className="space-y-3">
                <MatchSearchCard
                  teamAName={fixture.teamAName}
                  teamBName={fixture.teamBName}
                  teamAPlayers={fixture.teamAPlayers}
                  teamBPlayers={fixture.teamBPlayers}
                  searchA={searchA}
                  searchB={searchB}
                  setSearchA={setSearchA}
                  setSearchB={setSearchB}
                />

                {/* ── Status Filter + Export ────────────────────────── */}
                <div className="flex gap-2 flex-wrap items-center">
                  {([
                    { f: 'all',         label: `All (${fixture.progress.total})` },
                    { f: 'in_progress', label: `🔴 Live (${fixture.progress.inProgress})` },
                    { f: 'pending',     label: `⏳ Pending (${pendingCount})` },
                    { f: 'completed',   label: `✅ Done (${fixture.progress.completed + fixture.progress.notPlayed})` },
                  ] as { f: StatusFilter; label: string }[]).map(({ f, label }) => (
                    <button key={f} onClick={() => setStatusFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        statusFilter === f
                          ? f === 'in_progress'
                            ? 'bg-orange-700 text-white border-orange-600'
                            : 'bg-amber-600 text-white border-amber-600'
                          : 'border-amber-800/40 text-amber-300/70 hover:border-amber-500 hover:bg-white/5'
                      }`}>
                      {label}
                    </button>
                  ))}

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
                    searchA={searchA}
                    searchB={searchB}
                    statusFilter={statusFilter}
                    onResult={handleResult}
                    onScore={handleScore}
                    onStart={handleStart}
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

      {/* ── Fixed History Ribbon (right edge) ─────────────────────────────── */}
      <button
        className="bs-ribbon-btn"
        onClick={() => setHistoryPanelOpen(true)}
        title="Tournament History"
        aria-label="Open tournament history"
      >
        <Trophy size={14} className="text-amber-400 mb-1" />
        {'HISTORY'.split('').map((ch, i) => (
          <span key={i} className="text-[8px] font-black leading-none" style={{ color: 'rgba(240,210,100,0.80)' }}>{ch}</span>
        ))}
        {tournaments.length > 0 && (
          <span className="mt-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-700/50 text-amber-200 leading-none">
            {tournaments.length}
          </span>
        )}
      </button>

      {/* ── History Side Panel ────────────────────────────────────────────── */}
      {historyPanelOpen && (
        <>
          {/* Backdrop */}
          <div className="bs-panel-backdrop" onClick={() => setHistoryPanelOpen(false)} />

          {/* Panel */}
          <div className="bs-history-panel">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: '1px solid rgba(212,175,55,0.25)', background: 'rgba(8,22,10,0.95)' }}>
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-amber-400" />
                <span className="font-black text-amber-300 text-sm tracking-wide">Tournament History</span>
                {tournaments.length > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-700/35 text-amber-300">
                    {tournaments.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setHistoryPanelOpen(false)}
                className="text-amber-400/50 hover:text-amber-300 transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            {/* Subtitle */}
            {!historyLoading && tournaments.length > 0 && (
              <div className="px-4 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-[10px]" style={{ color: 'rgba(240,237,214,0.40)' }}>
                  {tournaments.filter(t => !t.isFinished && t.completedMatches > 0).length} ongoing ·{' '}
                  {tournaments.filter(t => t.isFinished).length} finished ·{' '}
                  {tournaments.filter(t => t.completedMatches === 0).length} not started
                </span>
              </div>
            )}

            {/* Panel content — scrollable list */}
            <div className="flex-1 overflow-y-auto p-3">
              <TournamentHistory
                tournaments={tournaments}
                loading={historyLoading}
                onOpen={(id) => {
                  setHistoryPanelOpen(false);
                  handleOpenTournament(id);
                }}
                onDelete={isAdmin ? handleDeleteTournament : undefined}
                deletingId={deletingTournamentId}
                panelMode
              />
            </div>
          </div>
        </>
      )}

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