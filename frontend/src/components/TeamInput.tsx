import { useState } from 'react';
import { Plus, Trash2, ClipboardList } from 'lucide-react';
import type { CreateFixturePayload, ScheduleMode } from '../types';

interface Props {
  onSubmit: (payload: CreateFixturePayload) => void;
  loading: boolean;
}

function TeamPanel({
  teamName, setTeamName, players, setPlayers, label, accentColor, lightBg,
}: {
  teamName: string; setTeamName: (v: string) => void;
  players: string[]; setPlayers: (v: string[]) => void;
  label: string; accentColor: string; lightBg: string;
}) {
  const [input, setInput] = useState('');

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
    <div className="flex-1 min-w-0 rounded-xl overflow-hidden border-2" style={{ borderColor: accentColor }}>
      {/* Team header */}
      <div className="px-4 py-2.5 flex items-center" style={{ background: accentColor }}>
        <span className="text-white font-black text-sm tracking-widest uppercase">{label}</span>
      </div>
      <div className="p-4">
        <div className="mb-3">
          <label className="block text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: 'rgba(240,237,214,0.7)' }}>Team Name</label>
          <input
            className="w-full border-2 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none transition-colors"
            style={{ borderColor: `${accentColor}44`, background: lightBg }}
            placeholder={`e.g. ${label === 'Team A' ? 'Falcons' : 'Eagles'}`}
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 border-2 rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
            style={{ borderColor: `${accentColor}33` }}
            placeholder="Player name"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
          />
          <button onClick={addPlayer}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm font-bold transition-colors hover:opacity-90"
            style={{ background: accentColor }}>
            <Plus size={15} /> Add
          </button>
        </div>

        <button
          onClick={() => {
            const raw = prompt('Paste player names (comma or newline separated):');
            if (raw) pasteList(raw);
          }}
          className="mb-3 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
          style={{ color: accentColor }}
        >
          <ClipboardList size={13} /> Paste list
        </button>

        <ul className="space-y-1 max-h-52 overflow-y-auto">
          {players.map((p, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm border"
              style={{ background: lightBg, borderColor: `${accentColor}55` }}>
              <span className="font-semibold" style={{ color: '#f0edd6' }}>{i + 1}. {p}</span>
              <button onClick={() => setPlayers(players.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>

        {players.length > 0 && (
          <p className="text-xs mt-1 font-medium" style={{ color: accentColor }}>
            {players.length} / 20 players ✓
          </p>
        )}
      </div>
    </div>
  );
}

export default function TeamInput({ onSubmit, loading }: Props) {
  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('full_fixture');

  const canGenerate = teamAName && teamBName && teamAPlayers.length >= 4 && teamBPlayers.length >= 4;

  function handleSubmit() {
    if (!canGenerate) return;
    onSubmit({
      teamAName, teamBName, teamAPlayers, teamBPlayers,
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

      <div className="p-6">
        {/* Team panels */}
        <div className="flex flex-col sm:flex-row gap-5 mb-6">
          <TeamPanel label="Team A"
            accentColor="#0D7C7C" lightBg="rgba(13,124,124,0.18)"
            teamName={teamAName} setTeamName={setTeamAName}
            players={teamAPlayers} setPlayers={setTeamAPlayers} />
          <div className="w-px bg-gradient-to-b from-transparent via-amber-300 to-transparent hidden sm:block" />
          <TeamPanel label="Team B"
            accentColor="#8B1A1A" lightBg="rgba(139,26,26,0.18)"
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
