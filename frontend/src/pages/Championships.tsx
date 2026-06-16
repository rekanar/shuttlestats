import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { championshipsApi, type NewEventConfig } from '../api/championshipsApi';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';
import CreateChampionship from '../components/CreateChampionship';
import BracketView from '../components/BracketView';
import type { Championship, ChampionshipSummary, ChampionshipEvent } from '../types/championship';
import { categoryLabel, categoryIcon } from '../types/championship';
import {
  Trophy, ArrowLeft, Plus, Lock, ShieldCheck, LogOut, Loader2, CloudUpload, CheckCircle2, Trash2, Calendar,
} from 'lucide-react';

type View = 'list' | 'create' | 'detail';

export default function Championships() {
  const { isAdmin, loading: authLoading, user, logout, isDev, devAdmin, setDevAdmin } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const [view, setView] = useState<View>('list');
  const [list, setList] = useState<ChampionshipSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [champ, setChamp] = useState<Championship | null>(null);
  const [eventIdx, setEventIdx] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setListLoading(true);
    try { setList(await championshipsApi.list()); } catch { /* silent */ }
    finally { setListLoading(false); }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  // Deep-link from the dashboard: ?open=<id> opens a championship, ?create=1 opens the create form.
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkApplied = useRef(false);
  useEffect(() => {
    if (authLoading || deepLinkApplied.current) return;
    deepLinkApplied.current = true;
    const openId = searchParams.get('open');
    const create = searchParams.get('create');
    if (openId) handleOpen(openId);
    else if (create && isAdmin) setView('create');
    if (openId || create) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  async function handleCreate(name: string, configs: NewEventConfig[]) {
    setCreating(true); setError(null);
    try {
      const c = championshipsApi.build(name, configs);
      await championshipsApi.save(c);
      setChamp(c);
      setEventIdx(0);
      setDirty(false);
      setView('detail');
      loadList();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create championship.');
    } finally { setCreating(false); }
  }

  async function handleOpen(id: string) {
    setError(null);
    try {
      const c = await championshipsApi.get(id);
      setChamp(c);
      setEventIdx(0);
      setDirty(false);
      setView('detail');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to open championship.');
    }
  }

  async function handleSave() {
    if (!champ) return;
    setSaving(true);
    try {
      await championshipsApi.save(champ);
      setDirty(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
      loadList();
    } catch (e: any) {
      alert(e?.message ?? 'Save failed. Check your connection.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? All brackets will be permanently removed.`)) return;
    try {
      await championshipsApi.delete(id);
      if (champ?.id === id) { setChamp(null); setView('list'); }
      loadList();
    } catch (e: any) {
      setError(e?.message ?? 'Delete failed.');
    }
  }

  function updateEvent(updated: ChampionshipEvent) {
    if (!champ) return;
    setChamp({ ...champ, events: champ.events.map((e, i) => (i === eventIdx ? updated : e)) });
    setDirty(true);
  }

  function backToList() {
    if (dirty && !confirm('You have unsaved changes. Leave without saving?')) return;
    setChamp(null);
    setView('list');
    setDirty(false);
    loadList();
  }

  const currentEvent = champ?.events[eventIdx] ?? null;

  return (
    <div className="min-h-screen relative">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="bs-header sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 relative flex items-center justify-center min-h-[56px] sm:min-h-[72px]">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" />
            <span className="font-black text-lg sm:text-xl tracking-wide" style={{ color: '#FFE066', textShadow: '0 0 14px rgba(255,215,0,0.5)' }}>
              CHAMPIONSHIPS
            </span>
          </div>

          {/* Left: back to fixtures */}
          <Link to="/" className="absolute left-2 sm:left-4 flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg border border-amber-800/40 text-xs sm:text-sm text-amber-300/80 hover:bg-white/5 transition-colors">
            <ArrowLeft size={13} /> <span className="hidden sm:inline">Fixtures</span>
          </Link>

          {/* Right: admin auth control */}
          {!authLoading && (
            <div className="absolute right-2 sm:right-4 flex items-center gap-2">
              {isAdmin ? (
                <>
                  <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(212,175,55,0.15)', color: '#FFE066', border: '1px solid rgba(212,175,55,0.4)' }} title={user?.email ?? 'Admin'}>
                    <ShieldCheck size={12} /> Admin
                  </span>
                  <button onClick={logout} className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-amber-800/40 text-xs text-amber-300/80 hover:bg-white/5 transition-colors">
                    <LogOut size={12} /> <span className="hidden sm:inline">Sign out</span>
                  </button>
                </>
              ) : (
                <button onClick={() => setLoginOpen(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-800/40 text-xs text-amber-300/80 hover:bg-white/5 transition-colors">
                  <Lock size={12} /> <span className="hidden sm:inline">Admin sign in</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-2 sm:px-4 py-3 sm:py-6 relative z-10">
        {error && <div className="mb-4 p-3 bg-red-900/80 border border-red-600/50 rounded-lg text-sm text-red-200">{error}</div>}

        {/* ── LIST ──────────────────────────────────────────────────────── */}
        {view === 'list' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.2)' }} />
              <span className="text-xs font-bold text-amber-300/60 uppercase tracking-widest">Tournaments / Championships</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.2)' }} />
            </div>

            {isAdmin && (
              <div className="flex justify-center mb-5">
                <button onClick={() => setView('create')} className="bs-btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
                  <Plus size={16} /> New Championship
                </button>
              </div>
            )}

            {listLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', height: '74px' }} />)}
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-amber-900/30" style={{ background: 'rgba(8,25,12,0.35)' }}>
                <Trophy size={28} className="text-amber-400/30 mx-auto mb-2" />
                <p className="text-sm text-amber-200/40">No championships yet.</p>
                {isAdmin
                  ? <p className="text-xs text-amber-200/25 mt-1">Click “New Championship” to create one.</p>
                  : <p className="text-xs text-amber-200/25 mt-1">An admin can create one.</p>}
              </div>
            ) : (
              <div className="space-y-2">
                {list.map(c => (
                  <div key={c.id} className="bs-card flex items-center gap-3 px-4 py-3 cursor-pointer hover:scale-[1.01] transition-transform"
                    onClick={() => handleOpen(c.id)}>
                    <Trophy size={18} className="text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm truncate" style={{ color: '#f0edd6' }}>{c.name}</div>
                      <div className="text-[11px] text-amber-200/40 flex items-center gap-2">
                        <Calendar size={10} /> {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span>·</span> {c.eventCount} event{c.eventCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={e => { e.stopPropagation(); handleDelete(c.id, c.name); }}
                        className="text-red-500/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-900/20 transition-colors shrink-0" title="Delete championship">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE ────────────────────────────────────────────────────── */}
        {view === 'create' && isAdmin && (
          <div>
            <button onClick={() => setView('list')} className="mb-4 flex items-center gap-1 text-xs text-amber-300/70 hover:text-amber-200">
              <ArrowLeft size={13} /> Back to list
            </button>
            <CreateChampionship onCreate={handleCreate} loading={creating} />
          </div>
        )}

        {/* ── DETAIL ────────────────────────────────────────────────────── */}
        {view === 'detail' && champ && (
          <div>
            <button onClick={backToList} className="mb-3 flex items-center gap-1 text-xs text-amber-300/70 hover:text-amber-200">
              <ArrowLeft size={13} /> All championships
            </button>

            {/* Save banner (admin, when dirty) */}
            {isAdmin && dirty && !savedFlash && (
              <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: 'rgba(212,130,0,0.15)', borderColor: 'rgba(212,130,0,0.45)' }}>
                <CloudUpload size={16} className="text-amber-400 shrink-0" />
                <span className="flex-1 text-sm font-bold text-amber-300">Unsaved changes</span>
                <button onClick={handleSave} disabled={saving}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#d4af37,#b8860b)', color: '#0a0a0a' }}>
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <CloudUpload size={13} />}
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
            {savedFlash && (
              <div className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border" style={{ background: 'rgba(0,200,80,0.12)', borderColor: 'rgba(0,200,80,0.35)' }}>
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span className="text-sm font-bold text-emerald-300">Saved to cloud!</span>
              </div>
            )}

            {/* Championship title */}
            <div className="bs-card px-4 py-3 mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-amber-400 shrink-0" />
              <span className="font-black text-base text-amber-300">{champ.name}</span>
              {!isAdmin && <span className="ml-auto text-[11px] text-amber-200/40">View only</span>}
            </div>

            {/* Event tabs */}
            {champ.events.length > 1 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {champ.events.map((ev, i) => (
                  <button key={ev.id} onClick={() => setEventIdx(i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
                    style={i === eventIdx
                      ? { background: 'rgba(212,175,55,0.2)', color: '#FFE066', borderColor: 'rgba(212,175,55,0.6)' }
                      : { background: 'transparent', color: 'rgba(240,237,214,0.6)', borderColor: 'rgba(212,175,55,0.25)' }}>
                    <span>{categoryIcon(ev.category)}</span> {categoryLabel(ev.category)}
                    <span className="opacity-60">({ev.drawSize})</span>
                  </button>
                ))}
              </div>
            )}

            {/* Bracket */}
            {currentEvent && (
              <div className="bs-card p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{categoryIcon(currentEvent.category)}</span>
                  <span className="font-black text-amber-300">{categoryLabel(currentEvent.category)}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,237,214,0.55)' }}>
                    {currentEvent.drawSize}-player draw · {currentEvent.drawSize - 1} matches
                  </span>
                </div>
                <BracketView event={currentEvent} canEdit={isAdmin} onChange={updateEvent} />
              </div>
            )}
          </div>
        )}
      </main>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

      {/* DEV ONLY admin toggle */}
      {isDev && (
        <button onClick={() => setDevAdmin(!devAdmin)} title="Dev-only: toggle the admin role"
          className="fixed bottom-3 left-3 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black shadow-lg transition-colors"
          style={{
            background: devAdmin ? 'linear-gradient(135deg,#d4af37,#b8860b)' : 'rgba(8,22,12,0.95)',
            color: devAdmin ? '#0a0a0a' : '#9ca3af',
            border: `1px solid ${devAdmin ? 'rgba(212,175,55,0.6)' : 'rgba(120,120,120,0.4)'}`,
          }}>
          🧪 DEV · {devAdmin ? 'ADMIN' : 'Viewer'}
        </button>
      )}
    </div>
  );
}
