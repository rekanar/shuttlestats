import { useState } from 'react';
import type { PairStats, PlayerStats, StatsResponse } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const COLORS_A = '#3B82F6';
const COLORS_B = '#F97316';

interface Props {
  stats: StatsResponse;
  teamAName: string;
  teamBName: string;
  totalRounds: number;
}

function truncate(name: string, max = 12) {
  return name.length > max ? name.slice(0, max) + '…' : name;
}

// ─── Wins by Pair Bar Chart ───────────────────────────────────────────────────
function WinsByPairChart({ pairStats, teamAName, teamBName }: { pairStats: PairStats[]; teamAName: string; teamBName: string }) {
  const data = pairStats.map(s => ({
    name: truncate(`${s.players[0]} & ${s.players[1]}`),
    wins: s.won,
    team: s.team,
    fill: s.team === 'A' ? COLORS_A : COLORS_B,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 Wins by Pair</h4>
      <p className="text-xs text-gray-400 mb-2">
        <span className="inline-block w-3 h-3 rounded-sm bg-blue-500 mr-1" />{teamAName}
        <span className="inline-block w-3 h-3 rounded-sm bg-orange-400 ml-3 mr-1" />{teamBName}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v: number) => [`${v} wins`, 'Wins']} />
          <Bar dataKey="wins" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Win % Horizontal Bar ─────────────────────────────────────────────────────
function WinPctChart({ pairStats }: { pairStats: PairStats[]; teamAName: string; teamBName: string }) {
  const sorted = [...pairStats].sort((a, b) => b.winPct - a.winPct);
  const avg = pairStats.length
    ? +(pairStats.reduce((s, p) => s + p.winPct, 0) / pairStats.length).toFixed(1)
    : 0;
  const data = sorted.map(s => ({
    name: truncate(`${s.players[0]} & ${s.players[1]}`),
    winPct: s.winPct,
    fill: s.team === 'A' ? COLORS_A : COLORS_B,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-1">📈 Win % by Pair</h4>
      <p className="text-xs text-gray-400 mb-3">Tournament average: {avg}%</p>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 28)}>
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
          <Tooltip formatter={(v: number) => [`${v}%`, 'Win %']} />
          <ReferenceLine x={avg} stroke="#a78bfa" strokeDasharray="4 4" label={{ value: `Avg ${avg}%`, position: 'top', fontSize: 10, fill: '#a78bfa' }} />
          <Bar dataKey="winPct" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Team Win Share Pie ───────────────────────────────────────────────────────
function TeamSharePie({ pairStats, teamAName, teamBName }: { pairStats: PairStats[]; teamAName: string; teamBName: string }) {
  const aWins = pairStats.filter(s => s.team === 'A').reduce((sum, s) => sum + s.won, 0);
  const bWins = pairStats.filter(s => s.team === 'B').reduce((sum, s) => sum + s.won, 0);
  const total = aWins + bWins;
  const data = [
    { name: teamAName, value: aWins },
    { name: teamBName, value: bWins },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">🥧 Team Win Share</h4>
      {total === 0
        ? <p className="text-sm text-gray-400 text-center py-6">No completed matches yet.</p>
        : (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value} (${total ? Math.round(value / total * 100) : 0}%)`}
                labelLine={false} fontSize={11}>
                <Cell fill={COLORS_A} />
                <Cell fill={COLORS_B} />
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} wins`, '']} />
            </PieChart>
          </ResponsiveContainer>
        )}
    </div>
  );
}

// ─── Player Win % Bar ─────────────────────────────────────────────────────────
function PlayerWinPctChart({ playerStats }: { playerStats: PlayerStats[]; teamAName: string; teamBName: string }) {
  const data = [...playerStats]
    .sort((a, b) => b.winPct - a.winPct)
    .map(s => ({ name: truncate(s.playerName, 10), winPct: s.winPct, team: s.team, fill: s.team === 'A' ? COLORS_A : COLORS_B }));
  const avg = data.length ? +(data.reduce((s, d) => s + d.winPct, 0) / data.length).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-1">👤 Player Win %</h4>
      <p className="text-xs text-gray-400 mb-3">Avg: {avg}%</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 36 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip formatter={(v: number) => [`${v}%`, 'Win %']} />
          <ReferenceLine y={avg} stroke="#a78bfa" strokeDasharray="4 4" />
          <Bar dataKey="winPct" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Points Progression Line Chart ───────────────────────────────────────────
function PointsProgressionChart({ progression, totalRounds, teamAPlayers }: {
  progression: Record<string, number[]>; totalRounds: number;
  teamAPlayers: string[]; teamBPlayers: string[];
}) {
  const players = Object.keys(progression);
  if (!players.length) return null;

  const chartData = Array.from({ length: totalRounds }, (_, r) => {
    const point: Record<string, number | string> = { round: `R${r + 1}` };
    for (const p of players) {
      point[p] = progression[p]?.[r] ?? 0;
    }
    return point;
  });

  const colorScale = (name: string) => teamAPlayers.includes(name) ? COLORS_A : COLORS_B;
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggle = (name: string) => setHidden(prev => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-1">📉 Points Progression (round by round)</h4>
      <p className="text-xs text-gray-400 mb-2">Click player names in legend to show/hide.</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {players.map(p => (
          <button key={p} onClick={() => toggle(p)}
            className={`px-2 py-0.5 rounded-full text-xs border transition-opacity ${hidden.has(p) ? 'opacity-30' : 'opacity-100'}`}
            style={{ borderColor: colorScale(p), color: colorScale(p) }}>
            {p}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="round" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ display: 'none' }} />
          {players.filter(p => !hidden.has(p)).map(p => (
            <Line key={p} type="monotone" dataKey={p} stroke={colorScale(p)}
              strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Player Stats Table ───────────────────────────────────────────────────────
function PlayerStatsTable({ playerStats, teamAName, teamBName }: { playerStats: PlayerStats[]; teamAName: string; teamBName: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-800">👤 Player Stats</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-center">Team</th>
              <th className="px-3 py-2 text-center">P</th>
              <th className="px-3 py-2 text-center">W</th>
              <th className="px-3 py-2 text-center">D</th>
              <th className="px-3 py-2 text-center">L</th>
              <th className="px-3 py-2 text-center font-bold text-indigo-700">Pts</th>
              <th className="px-3 py-2 text-center">Win%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {playerStats.map(s => (
              <tr key={s.playerName} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-800">{s.playerName}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.team === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {s.team === 'A' ? teamAName : teamBName}
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-gray-600">{s.played}</td>
                <td className="px-3 py-2 text-center text-green-600 font-medium">{s.won}</td>
                <td className="px-3 py-2 text-center text-gray-500">{s.drawn}</td>
                <td className="px-3 py-2 text-center text-red-400">{s.lost}</td>
                <td className="px-3 py-2 text-center font-bold text-indigo-700">{s.points}</td>
                <td className="px-3 py-2 text-center font-semibold text-gray-700">{s.winPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main StatsPanel ──────────────────────────────────────────────────────────

export default function StatsPanel({ stats, teamAName, teamBName, totalRounds }: Props) {
  const { pairStats, playerStats, progression } = stats;
  const teamAPlayers = playerStats.filter(s => s.team === 'A').map(s => s.playerName);
  const teamBPlayers = playerStats.filter(s => s.team === 'B').map(s => s.playerName);

  const hasData = pairStats.some(s => s.played > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-400">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm">Enter match results to see stats and charts.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <WinsByPairChart pairStats={pairStats} teamAName={teamAName} teamBName={teamBName} />
          <WinPctChart pairStats={pairStats} teamAName={teamAName} teamBName={teamBName} />
        </div>
        <div>
          <TeamSharePie pairStats={pairStats} teamAName={teamAName} teamBName={teamBName} />
          <PlayerWinPctChart playerStats={playerStats} teamAName={teamAName} teamBName={teamBName} />
        </div>
      </div>
      <PointsProgressionChart progression={progression} totalRounds={totalRounds} teamAPlayers={teamAPlayers} teamBPlayers={teamBPlayers} />
      <PlayerStatsTable playerStats={playerStats} teamAName={teamAName} teamBName={teamBName} />
    </div>
  );
}
