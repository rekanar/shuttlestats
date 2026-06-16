import type { ChampionshipEvent, BracketMatch } from '../types/championship';
import { Trophy } from 'lucide-react';

interface Props {
  event: ChampionshipEvent;
  canEdit: boolean;
  onChange: (updated: ChampionshipEvent) => void;
}

const SIDE_COLORS = { 1: '#00BFFF', 2: '#FFD700' } as const;

export default function BracketView({ event, canEdit, onChange }: Props) {
  function update(roundIdx: number, matchIdx: number, fn: (m: BracketMatch) => BracketMatch) {
    const rounds = event.rounds.map((r, ri) =>
      ri !== roundIdx ? r : { ...r, matches: r.matches.map((m, mi) => (mi !== matchIdx ? m : fn(m))) }
    );
    onChange({ ...event, rounds });
  }

  const setName = (ri: number, mi: number, side: 1 | 2, slot: number, value: string) =>
    update(ri, mi, m => {
      const arr = [...(side === 1 ? m.side1 : m.side2)];
      arr[slot] = value;
      return side === 1 ? { ...m, side1: arr } : { ...m, side2: arr };
    });

  const setWinner = (ri: number, mi: number, side: 1 | 2) =>
    update(ri, mi, m => ({ ...m, winner: m.winner === side ? null : side }));

  const setScore = (ri: number, mi: number, value: string) =>
    update(ri, mi, m => ({ ...m, score: value || null }));

  // Champion = winner of the Final.
  const finalMatch = event.rounds[event.rounds.length - 1]?.matches[0];
  const champ = finalMatch?.winner ? (finalMatch.winner === 1 ? finalMatch.side1 : finalMatch.side2) : null;
  const champName = champ && champ.some(Boolean) ? champ.filter(Boolean).join(' & ') : null;

  function SideBlock({ ri, mi, side, m }: { ri: number; mi: number; side: 1 | 2; m: BracketMatch }) {
    const names = side === 1 ? m.side1 : m.side2;
    const isWinner = m.winner === side;
    const decided = m.winner !== null;
    const color = SIDE_COLORS[side];

    return (
      <div
        className={`flex-1 rounded-lg p-2 transition-all ${isWinner ? 'bs-pair bs-pair-win' : decided ? 'opacity-50' : ''}`}
        style={{ border: `1px solid ${color}55`, background: `${color}10` }}
      >
        <div className="space-y-1">
          {names.map((nm, si) => (
            canEdit ? (
              <input
                key={si}
                value={nm}
                onChange={e => setName(ri, mi, side, si, e.target.value)}
                placeholder={`Player ${si + 1}`}
                className="w-full text-xs sm:text-sm font-bold rounded px-2 py-1 focus:outline-none focus:ring-1"
                style={{ background: 'rgba(0,0,0,0.25)', color, border: `1px solid ${color}40` }}
              />
            ) : (
              <div key={si} className="text-xs sm:text-sm font-bold px-1" style={{ color }}>
                {nm || <span className="opacity-30">—</span>}
              </div>
            )
          ))}
        </div>
        {canEdit ? (
          <button
            onClick={() => setWinner(ri, mi, side)}
            className="mt-1.5 w-full py-1 rounded text-[10px] font-black uppercase tracking-wide transition-all"
            style={{
              background: isWinner ? 'rgba(16,200,110,0.25)' : 'transparent',
              color: isWinner ? '#4ef0a0' : `${color}aa`,
              border: `1px solid ${isWinner ? 'rgba(16,220,120,0.6)' : `${color}40`}`,
            }}
          >
            {isWinner ? '✓ Winner' : 'Mark Win'}
          </button>
        ) : (
          isWinner && <span className="bs-outcome-tag bs-tag-win mt-1">✓ Won</span>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Champion banner */}
      {champName && (
        <div className="mb-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.05))', border: '1px solid rgba(255,215,0,0.5)', boxShadow: '0 0 20px rgba(255,215,0,0.2)' }}>
          <Trophy size={18} style={{ color: '#FFD700' }} />
          <span className="text-sm font-black" style={{ color: '#FFE066' }}>Champion: {champName}</span>
        </div>
      )}

      {event.rounds.map((round, ri) => {
        const isFinal = ri === event.rounds.length - 1;
        return (
          <div key={ri} className="mb-4">
            <div className="bs-section-header rounded-t-lg" style={isFinal ? { background: 'linear-gradient(135deg, #2a1e02, #6b5410, #2a1e02)' } : undefined}>
              {isFinal && <Trophy size={14} className="text-amber-300" />}
              <span className="text-amber-100">{round.name}</span>
              <span className="ml-auto text-[11px] font-normal text-amber-300/60">
                {round.matches.length} match{round.matches.length !== 1 ? 'es' : ''}
              </span>
            </div>
            <div className="space-y-2 p-2 rounded-b-lg" style={{ background: 'rgba(0,0,0,0.18)' }}>
              {round.matches.map((m, mi) => (
                <div key={m.id} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-amber-200/40">Match {mi + 1}</span>
                  </div>
                  <div className="flex items-stretch gap-2">
                    <SideBlock ri={ri} mi={mi} side={1} m={m} />
                    <div className="flex items-center text-amber-200/40 text-xs font-black">vs</div>
                    <SideBlock ri={ri} mi={mi} side={2} m={m} />
                  </div>
                  {/* Score */}
                  {canEdit ? (
                    <input
                      value={m.score ?? ''}
                      onChange={e => setScore(ri, mi, e.target.value)}
                      placeholder="Score (optional) e.g. 21-18, 21-15"
                      className="mt-2 w-full text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      style={{ background: 'rgba(0,0,0,0.25)', color: '#f0edd6', border: '1px solid rgba(212,175,55,0.25)' }}
                    />
                  ) : (
                    m.score && <div className="mt-2 text-xs text-amber-200/60 text-center">{m.score}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
