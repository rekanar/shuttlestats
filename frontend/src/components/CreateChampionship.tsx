import { useState } from 'react';
import { EVENT_CATEGORIES, DRAW_SIZES } from '../types/championship';
import type { EventCategory } from '../types/championship';
import type { NewEventConfig } from '../api/championshipsApi';

interface Props {
  onCreate: (name: string, configs: NewEventConfig[]) => void;
  loading: boolean;
}

type Sel = Record<EventCategory, { on: boolean; drawSize: number }>;

const initSel = (): Sel =>
  EVENT_CATEGORIES.reduce((acc, c) => {
    acc[c.key] = { on: false, drawSize: 8 };
    return acc;
  }, {} as Sel);

export default function CreateChampionship({ onCreate, loading }: Props) {
  const [name, setName] = useState('');
  const [sel, setSel] = useState<Sel>(initSel);

  const anyOn = Object.values(sel).some(s => s.on);
  const canCreate = !!name.trim() && anyOn;

  function toggle(key: EventCategory) {
    setSel(s => ({ ...s, [key]: { ...s[key], on: !s[key].on } }));
  }
  function setDraw(key: EventCategory, drawSize: number) {
    setSel(s => ({ ...s, [key]: { ...s[key], drawSize, on: true } }));
  }

  function submit() {
    if (!canCreate) return;
    const configs: NewEventConfig[] = EVENT_CATEGORIES
      .filter(c => sel[c.key].on)
      .map(c => ({ category: c.key, drawSize: sel[c.key].drawSize }));
    onCreate(name.trim(), configs);
  }

  return (
    <div className="bs-card p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <label className="block text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: 'rgba(240,237,214,0.7)' }}>
          🏆 Championship Name
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Indian Open 2026"
          className="w-full border-2 rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none"
          style={{ borderColor: 'rgba(212,175,55,0.45)', background: 'rgba(212,175,55,0.07)', color: '#f0edd6' }}
        />
      </div>

      <div className="mb-5">
        <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'rgba(240,237,214,0.7)' }}>
          Events
        </label>
        <div className="space-y-2">
          {EVENT_CATEGORIES.map(c => {
            const s = sel[c.key];
            return (
              <div key={c.key}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
                style={{
                  border: `1px solid ${s.on ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.18)'}`,
                  background: s.on ? 'rgba(212,175,55,0.08)' : 'rgba(0,0,0,0.2)',
                }}>
                <button onClick={() => toggle(c.key)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0"
                    style={{ border: `2px solid ${s.on ? '#D4AF37' : 'rgba(212,175,55,0.4)'}`, background: s.on ? '#D4AF37' : 'transparent', color: '#0a0a0a' }}>
                    {s.on ? '✓' : ''}
                  </span>
                  <span className="text-lg">{c.icon}</span>
                  <span className="text-sm font-bold" style={{ color: s.on ? '#FFE066' : 'rgba(240,237,214,0.7)' }}>{c.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,237,214,0.5)' }}>
                    {c.sideSize === 1 ? 'Singles' : 'Doubles'}
                  </span>
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(240,237,214,0.45)' }}>Draw</span>
                  <select
                    value={s.drawSize}
                    onChange={e => setDraw(c.key, Number(e.target.value))}
                    className="text-xs font-bold rounded-lg px-2 py-1 focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#f0edd6', border: '1px solid rgba(212,175,55,0.35)' }}
                  >
                    {DRAW_SIZES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] mt-2" style={{ color: 'rgba(240,237,214,0.45)' }}>
          Pick the events to run and the draw size (number of entrants) for each. A draw of N has N−1 matches. You'll enter player names manually for every round.
        </p>
      </div>

      <button
        onClick={submit}
        disabled={!canCreate || loading}
        className="bs-btn-generate w-full py-3.5 rounded-xl text-base tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Creating…' : '🏆 Create Championship'}
      </button>
      {!canCreate && (
        <p className="text-[11px] text-center mt-2" style={{ color: 'rgba(240,237,214,0.4)' }}>
          Enter a name and select at least one event.
        </p>
      )}
    </div>
  );
}
