import { useState } from 'react';
import { Trophy, Trash2, ChevronRight, ChevronDown, ChevronUp, Calendar, Users, Loader2 } from 'lucide-react';
import type { TournamentSummary } from '../types';

interface Props {
  tournaments: TournamentSummary[];
  loading: boolean;
  onOpen: (id: string) => void;
  /** Omit to hide delete controls entirely (e.g. for non-admin viewers) */
  onDelete?: (id: string, name: string) => void;
  deletingId?: string | null;
  /** When true, renders as a flat list (no accordion toggle) for use inside a side panel */
  panelMode?: boolean;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function TournamentCard({ t, onOpen, onDelete, isDeleting }: {
  t: TournamentSummary;
  onOpen: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
  isDeleting?: boolean;
}) {
  const isNew = t.completedMatches === 0 && t.pct === 0;
  const statusColor = t.isFinished ? '#D4AF37' : isNew ? '#60a5fa' : '#00BFFF';
  const statusLabel = t.isFinished ? '🏆 Finished' : isNew ? '🆕 Not Started' : '⏳ Ongoing';

  return (
    <div
      className="relative flex items-stretch rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-[1.015]"
      style={{
        background: 'rgba(8,25,12,0.75)',
        backdropFilter: 'blur(16px)',
        border: t.isFinished ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(77,212,200,0.18)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        opacity: isDeleting ? 0.6 : 1,
        pointerEvents: isDeleting ? 'none' : undefined,
      }}
      onClick={() => !isDeleting && onOpen(t.id)}
    >
      {/* Deleting overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl"
          style={{ background: 'rgba(8,25,12,0.75)', backdropFilter: 'blur(4px)' }}>
          <Loader2 size={15} className="text-red-400 animate-spin" />
          <span className="text-xs font-bold text-red-300">Deleting from cloud…</span>
        </div>
      )}
      {/* Left accent bar */}
      <div className="w-1 shrink-0 rounded-l-xl"
        style={{ background: t.isFinished ? 'linear-gradient(180deg,#D4AF37,#8B6914)' : isNew ? '#3b82f6' : 'linear-gradient(180deg,#33CCFF,#00BFFF)' }} />

      <div className="flex-1 px-3 py-3 min-w-0">
        {/* Top row: status badge + delete */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: statusColor, borderColor: `${statusColor}44`, background: `${statusColor}18` }}>
            {statusLabel}
          </span>
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); if (!isDeleting) onDelete(t.id, t.tournamentName); }}
              disabled={isDeleting}
              className="text-gray-600 hover:text-red-400 transition-colors p-0.5 rounded shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Delete tournament permanently — removes ALL match data"
            >
              {isDeleting ? <Loader2 size={12} className="animate-spin text-red-400" /> : <Trash2 size={12} />}
            </button>
          )}
        </div>

        {/* Tournament name */}
        <h3 className="font-black text-sm leading-snug mb-1 group-hover:text-amber-300 transition-colors truncate"
          style={{ color: '#f0edd6' }}>
          {t.tournamentName}
        </h3>

        {/* Teams */}
        <div className="flex items-center gap-1 text-xs mb-2">
          <Users size={10} className="text-amber-400/40 shrink-0" />
          <span className="font-bold truncate" style={{ color: '#00BFFF' }}>{t.teamAName}</span>
          <span className="text-amber-200/25 shrink-0 px-0.5">vs</span>
          <span className="font-bold truncate" style={{ color: '#FFD700' }}>{t.teamBName}</span>
        </div>

        {/* Progress bar */}
        <div className="rounded-full h-1.5 overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-1.5 rounded-full"
            style={{
              width: `${t.pct}%`,
              background: t.isFinished
                ? 'linear-gradient(90deg,#8B6914,#D4AF37)'
                : 'linear-gradient(90deg,#00BFFF,#33CCFF)',
            }} />
        </div>

        {/* Date + match progress */}
        <div className="flex items-center justify-between">
          <span className="text-[10px]" style={{ color: 'rgba(240,237,214,0.35)' }}>
            <Calendar size={9} className="inline mr-0.5" />{formatDate(t.createdAt)}
          </span>
          <span className="text-[10px]" style={{ color: 'rgba(240,237,214,0.35)' }}>
            {t.completedMatches}/{t.totalMatches} matches · {t.pct}%
          </span>
        </div>
      </div>

      {/* Right: open chevron */}
      <div className="flex items-center pr-3 pl-1 shrink-0">
        <ChevronRight size={15} className="text-amber-400/35 group-hover:text-amber-300 transition-colors" />
      </div>
    </div>
  );
}

export default function TournamentHistory({ tournaments, loading, onOpen, onDelete, deletingId, panelMode }: Props) {
  const [open, setOpen] = useState(panelMode ?? false);

  const ongoingCount = tournaments.filter(t => !t.isFinished && t.completedMatches > 0).length;
  const finishedCount = tournaments.filter(t => t.isFinished).length;

  // ── Panel mode: flat list only (header provided by parent) ──────────────
  if (panelMode) {
    return (
      <div className="space-y-2">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', height: '88px' }} />
            ))}
          </div>
        )}
        {!loading && tournaments.length === 0 && (
          <div className="px-4 py-8 text-center rounded-xl border border-dashed border-amber-900/30"
            style={{ background: 'rgba(8,25,12,0.35)' }}>
            <Trophy size={24} className="text-amber-400/30 mx-auto mb-2" />
            <p className="text-sm text-amber-200/40">No past tournaments yet.</p>
            <p className="text-xs text-amber-200/25 mt-1">Create your first tournament!</p>
          </div>
        )}
        {!loading && tournaments.map(t => (
          <TournamentCard key={t.id} t={t} onOpen={onOpen} onDelete={onDelete} isDeleting={deletingId === t.id} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-5">
      {/* ── Accordion Toggle Header ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-200 group"
        style={{
          background: open ? 'rgba(212,175,55,0.10)' : 'rgba(8,25,12,0.55)',
          backdropFilter: 'blur(16px)',
          border: open ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(212,175,55,0.20)',
          boxShadow: open ? '0 4px 24px rgba(212,175,55,0.10)' : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <Trophy size={16} className="text-amber-400 shrink-0" />
          <div className="text-left">
            <div className="text-sm font-black text-amber-300 leading-none">
              Tournament History
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'rgba(240,237,214,0.45)' }}>
              {loading
                ? 'Loading…'
                : tournaments.length === 0
                  ? 'No tournaments yet — create your first below'
                  : `${tournaments.length} total · ${ongoingCount} ongoing · ${finishedCount} finished`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Count badge when collapsed */}
          {!open && tournaments.length > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-700/30 text-amber-300">
              {tournaments.length}
            </span>
          )}
          {open
            ? <ChevronUp size={16} className="text-amber-400" />
            : <ChevronDown size={16} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
          }
        </div>
      </button>

      {/* ── Expanded List ─────────────────────────────────────────────────── */}
      {open && (
        <div className="mt-2 space-y-0" style={{ animation: 'fadeIn 0.18s ease' }}>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="rounded-xl animate-pulse" style={{ background: 'rgba(8,25,12,0.55)', height: '88px' }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && tournaments.length === 0 && (
            <div className="px-4 py-5 text-center rounded-xl border border-dashed border-amber-900/30"
              style={{ background: 'rgba(8,25,12,0.35)' }}>
              <p className="text-xs text-amber-200/40">No past tournaments saved. Create one below!</p>
            </div>
          )}

          {/* Cards */}
          {!loading && tournaments.length > 0 && (
            <div className="space-y-2 max-h-[55vh] overflow-y-auto">
              {tournaments.map(t => (
                <TournamentCard key={t.id} t={t} onOpen={onOpen} onDelete={onDelete} isDeleting={deletingId === t.id} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
