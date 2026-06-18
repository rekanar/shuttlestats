import { useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import type { CreateFixturePayload, ScheduleMode } from '../types';

interface Props {
  onSubmit: (payload: CreateFixturePayload) => void;
  loading: boolean;
}

// Preset swatches — vivid radiants first, then white + light shades, then black.
const TEAM_COLOR_PRESETS = [
  // Vivid
  '#22D3EE', // cyan
  '#FBBF24', // gold
  '#F472B6', // magenta
  '#A3E635', // lime
  '#FB923C', // orange
  '#A78BFA', // violet
  '#F87171', // red
  '#38BDF8', // sky
  // Light / neutral shades
  '#FFFFFF', // white
  '#E2E8F0', // light slate
  '#A5F3FC', // light cyan
  '#BBF7D0', // light green
  '#FEF08A', // light yellow
  '#FBCFE8', // light pink
  '#DDD6FE', // light lavender
  '#FED7AA', // light peach
  // Dark
  '#000000', // black
];

// ─── Per-team color picker: radiant presets + a custom color input ─────────────
function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(240,237,214,0.6)' }}>
        Team Color
      </label>
      <div className="flex items-center gap-1.5 flex-wrap">
        {TEAM_COLOR_PRESETS.map(c => {
          const selected = value.toLowerCase() === c.toLowerCase();
          return (
            <button key={c} type="button" onClick={() => onChange(c)}
              aria-label={`Use color ${c}`}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110 active:scale-95"
              style={{
                background: c,
                // Faint ring keeps white/black/dark swatches visible on the panel;
                // selected gets a clear white halo offset by the navy bg.
                border: '2px solid rgba(255,255,255,0.35)',
                boxShadow: selected ? '0 0 0 2px #0f172a, 0 0 0 4px #ffffff' : `0 0 6px ${c}70`,
              }} />
          );
        })}
        {/* Custom color */}
        <label title="Custom color"
          className="relative w-7 h-7 rounded-full overflow-hidden cursor-pointer"
          style={{ border: '2px solid rgba(255,255,255,0.35)', background: 'conic-gradient(#f87171,#fb923c,#fbbf24,#a3e635,#22d3ee,#38bdf8,#a78bfa,#f472b6,#f87171)' }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </label>
        <span className="ml-1 text-[11px] font-mono font-bold" style={{ color: value }}>{value.toUpperCase()}</span>
      </div>
    </div>
  );
}

function TeamPanel({
  teamName, setTeamName, players, setPlayers, label, accentColor, onColorChange,
}: {
  teamName: string; setTeamName: (v: string) => void;
  players: string[]; setPlayers: (v: string[]) => void;
  label: string; accentColor: string; onColorChange: (v: string) => void;
}) {
  const [input, setInput] = useState('');
  const lightBg = `${accentColor}1A`;      // ~10% alpha
  const btnTextColor = '#0a1016';           // dark text reads on bright accents

  function addPlayer() {
    const name = input.trim();
    if (!name) return;
    if (players.includes(name)) { alert(`"${name}" is already in the list`); return; }
    if (players.length >= 20) { alert('Maximum 20 players per team'); return; }
    setPlayers([...players, name]);
    setInput('');
  }

  function pasteList(raw: string) {
    const names = raw.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    const unique = [...new Set([...players, ...names])].slice(0, 20);
    setPlayers(unique);
  }

  return (
    <div className="flex-1 min-w-0 rounded-xl overflow-hidden"
      style={{
        border: `2px solid ${accentColor}`,
        boxShadow: `0 0 24px ${accentColor}50, inset 0 1px 0 ${accentColor}20`,
        background: 'rgba(15,23,42,0.80)',
      }}>
      {/* Team header with diagonal stripe feel */}
      <div className="px-4 py-3 flex items-center gap-2 relative overflow-hidden"
        style={{ background: `linear-gradient(105deg, ${accentColor}EE 0%, ${accentColor}BB 60%, ${accentColor}88 100%)` }}>
        {/* Diagonal stripe accents */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'repeating-linear-gradient(60deg, transparent, transparent 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 14px)',
        }} />
        <span className="text-lg">🏸</span>
        <span className="bs-display font-bold text-base tracking-widest uppercase relative z-10" style={{ color: btnTextColor }}>{label}</span>
      </div>
      <div className="p-4">
        <div className="mb-3">
          <label className="block text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: 'rgba(240,237,214,0.6)' }}>Team Name</label>
          <input
            className="w-full border-2 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none transition-colors"
            style={{ borderColor: `${accentColor}55`, background: lightBg, color: '#f0edd6' }}
            placeholder={`e.g. ${label === 'Team A' ? 'Falcons' : 'Eagles'}`}
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
          />
        </div>

        {/* Team color */}
        <ColorPicker value={accentColor} onChange={onColorChange} />

        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 border-2 rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
            style={{ borderColor: `${accentColor}55`, background: 'rgba(0,0,0,0.30)', color: '#f0edd6' }}
            placeholder="Player name (press Enter to add)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
          />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={addPlayer}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110 active:scale-95"
            style={{ background: accentColor, color: btnTextColor, boxShadow: `0 0 12px ${accentColor}90` }}
          >
            <Plus size={13} /> Add
          </button>
          <button
            onClick={() => {
              const raw = prompt('Paste player names (comma or newline separated):');
              if (raw) pasteList(raw);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110 active:scale-95"
            style={{ background: accentColor, color: btnTextColor, boxShadow: `0 0 12px ${accentColor}90` }}
          >
            <ClipboardList size={13} /> Paste list
          </button>
        </div>

        {/* Player chips */}
        {players.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 pt-1">
            {players.map((p, i) => (
              <span key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                style={{
                  borderColor: accentColor,
                  color: '#f0edd6',
                  background: `${accentColor}22`,
                  boxShadow: `0 0 6px ${accentColor}35`,
                }}>
                🏸 {p}
                <button
                  onClick={() => setPlayers(players.filter((_, j) => j !== i))}
                  className="ml-0.5 text-sm leading-none hover:text-red-400 transition-colors opacity-50 hover:opacity-100">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {players.length > 0 && (
          <p className="text-xs mt-1.5 font-medium" style={{ color: accentColor }}>
            {players.length} / 20 players ✓
          </p>
        )}
      </div>
    </div>
  );
}

export default function TeamInput({ onSubmit, loading }: Props) {
  const [tournamentName, setTournamentName] = useState('');
  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [teamAColor, setTeamAColor] = useState('#22D3EE');
  const [teamBColor, setTeamBColor] = useState('#FBBF24');
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('full_fixture');

  const canGenerate = teamAName && teamBName && teamAPlayers.length >= 4 && teamBPlayers.length >= 4;

  function handleSubmit() {
    if (!canGenerate) return;
    onSubmit({
      tournamentName,
      teamAName, teamBName, teamAColor, teamBColor, teamAPlayers, teamBPlayers,
      scheduleMode,
      courtsAvailable: 4,
      matchDurationMins: 30,
      pointsScheme: { win: 2, draw: 1, loss: 0 },
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Card header */}
      <div className="bs-section-header" style={{ borderRadius: '1.1rem 1.1rem 0 0' }}>
        <span>🏸</span>
      </div>

      <div className="p-4 sm:p-6">
        {/* Tournament Name */}
        <div className="mb-5">
          <label className="block text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: 'rgba(240,237,214,0.7)' }}>
            🏆 Tournament Name
          </label>
          <input
            className="w-full border-2 rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none transition-colors"
            style={{ borderColor: 'rgba(212,175,55,0.45)', background: 'rgba(212,175,55,0.07)', color: '#f0edd6' }}
            placeholder="e.g. Summer Tournament 2026, Winter League…"
            value={tournamentName}
            onChange={e => setTournamentName(e.target.value)}
          />
          <p className="text-xs mt-1" style={{ color: 'rgba(240,237,214,0.4)' }}>Give this tournament a memorable name to find it later in history.</p>
        </div>

        {/* Team panels */}
        <div className="flex flex-col sm:flex-row gap-5 mb-6">
          <TeamPanel label="Team A"
            accentColor={teamAColor} onColorChange={setTeamAColor}
            teamName={teamAName} setTeamName={setTeamAName}
            players={teamAPlayers} setPlayers={setTeamAPlayers} />
          <div className="w-px bg-gradient-to-b from-transparent via-amber-300 to-transparent hidden sm:block" />
          <TeamPanel label="Team B"
            accentColor={teamBColor} onColorChange={setTeamBColor}
            teamName={teamBName} setTeamName={setTeamBName}
            players={teamBPlayers} setPlayers={setTeamBPlayers} />
        </div>

        {/* Settings row — Schedule Mode only */}
        <div className="border-t-2 border-amber-200/60 pt-5 mb-6">
          <div className="max-w-xs">
            <label className="block text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: 'rgba(240,237,214,0.7)' }}>Schedule Mode</label>
            <select
              className="w-full border-2 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none"
              style={{ borderColor: 'rgba(212,175,55,0.4)', background: 'rgba(255,255,255,0.08)', color: '#f0edd6' }}
              value={scheduleMode}
              onChange={e => setScheduleMode(e.target.value as ScheduleMode)}
            >
              <option value="full_fixture">Full Fixture — every pair plays every pair</option>
              <option value="fair_rounds">Fair Rounds — equal play time only</option>
            </select>
            <p className="text-xs mt-1" style={{ color: 'rgba(240,237,214,0.5)' }}>
              {scheduleMode === 'full_fixture'
                ? `All Team A pairs vs all Team B pairs — C(Nₐ,2)×C(Nₙ,2) total matches`
                : 'Equal play time for all players — fewer matches'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canGenerate || loading}
          className="bs-btn-generate w-full py-4 rounded-xl text-base tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Generating Schedule…' : '🏸 Generate Tournament Schedule'}
        </button>
      </div>
    </div>
  );
}
