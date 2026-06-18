import { useState, type CSSProperties } from 'react';
import type { PairStats, PlayerStats, StatsResponse } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface Props {
  stats: StatsResponse;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  totalRounds: number;
}

function truncate(name: string, max = 12) {
  return name.length > max ? name.slice(0, max) + '…' : name;
}

// ─── Wins by Pair Bar Chart ───────────────────────────────────────────────────
function WinsByPairChart({ pairStats, teamAName, teamBName, colorA, colorB }: { pairStats: PairStats[]; teamAName: string; teamBName: string; colorA: string; colorB: string }) {
  const data = pairStats.map(s => ({
    name: truncate(`${s.players[0]} & ${s.players[1]}`),
    wins: s.won,
    team: s.team,
    fill: s.team === 'A' ? colorA : colorB,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <h4 className="text-sm font-bold text-amber-300 mb-3">📊 Wins by Pair</h4>
      <p className="text-xs text-gray-400 mb-2">
        <span className="inline-block w-3 h-3 rounded-sm mr-1" style={{ background: colorA }} />{teamAName}
        <span className="inline-block w-3 h-3 rounded-sm ml-3 mr-1" style={{ background: colorB }} />{teamBName}
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
function WinPctChart({ pairStats, colorA, colorB }: { pairStats: PairStats[]; colorA: string; colorB: string }) {
  const sorted = [...pairStats].sort((a, b) => b.winPct - a.winPct);
  const avg = pairStats.length
    ? +(pairStats.reduce((s, p) => s + p.winPct, 0) / pairStats.length).toFixed(1)
    : 0;
  const data = sorted.map(s => ({
    name: truncate(`${s.players[0]} & ${s.players[1]}`),
    winPct: s.winPct,
    fill: s.team === 'A' ? colorA : colorB,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <h4 className="text-sm font-bold text-amber-300 mb-1">📈 Win % by Pair</h4>
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
function TeamSharePie({ pairStats, teamAName, teamBName, colorA, colorB }: { pairStats: PairStats[]; teamAName: string; teamBName: string; colorA: string; colorB: string }) {
  const aWins = pairStats.filter(s => s.team === 'A').reduce((sum, s) => sum + s.won, 0);
  const bWins = pairStats.filter(s => s.team === 'B').reduce((sum, s) => sum + s.won, 0);
  const total = aWins + bWins;
  const data = [
    { name: teamAName, value: aWins },
    { name: teamBName, value: bWins },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <h4 className="text-sm font-bold text-amber-300 mb-3">🥧 Team Win Share</h4>
      {total === 0
        ? <p className="text-sm text-gray-400 text-center py-6">No completed matches yet.</p>
        : (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value} (${total ? Math.round(value / total * 100) : 0}%)`}
                labelLine={false} fontSize={11}>
                <Cell fill={colorA} />
                <Cell fill={colorB} />
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} wins`, '']} />
            </PieChart>
          </ResponsiveContainer>
        )}
    </div>
  );
}

// ─── Player Win % Bar ─────────────────────────────────────────────────────────
function PlayerWinPctChart({ playerStats, colorA, colorB }: { playerStats: PlayerStats[]; colorA: string; colorB: string }) {
  const data = [...playerStats]
    .sort((a, b) => b.winPct - a.winPct)
    .map(s => ({ name: truncate(s.playerName, 10), winPct: s.winPct, team: s.team, fill: s.team === 'A' ? colorA : colorB }));
  const avg = data.length ? +(data.reduce((s, d) => s + d.winPct, 0) / data.length).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <h4 className="text-sm font-bold text-amber-300 mb-1">👤 Player Win %</h4>
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
function PointsProgressionChart({ progression, totalRounds, teamAPlayers, colorA, colorB }: {
  progression: Record<string, number[]>; totalRounds: number;
  teamAPlayers: string[]; colorA: string; colorB: string;
}) {
  const players = Object.keys(progression);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  if (!players.length) return null;

  const chartData = Array.from({ length: totalRounds }, (_, r) => {
    const point: Record<string, number | string> = { round: `R${r + 1}` };
    for (const p of players) {
      point[p] = progression[p]?.[r] ?? 0;
    }
    return point;
  });

  const colorScale = (name: string) => teamAPlayers.includes(name) ? colorA : colorB;
  const toggle = (name: string) => setHidden(prev => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <h4 className="text-sm font-bold text-amber-300 mb-1">📉 Points Progression (round by round)</h4>
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

// ─── Player Leaderboard ───────────────────────────────────────────────────────
// playerStats arrives already sorted by points desc, then win %.
function PlayerStatsTable({ playerStats, teamAName, teamBName, colorA, colorB }: { playerStats: PlayerStats[]; teamAName: string; teamBName: string; colorA: string; colorB: string }) {
  // Per-rank row background — top 3 get medal-coloured glows, top 10 a subtle tint.
  function rowStyle(rank: number): CSSProperties {
    if (rank === 1) return { background: 'linear-gradient(90deg, rgba(255,215,0,0.22), rgba(255,215,0,0.03))', boxShadow: 'inset 0 0 0 1px rgba(255,215,0,0.4)' };
    if (rank === 2) return { background: 'linear-gradient(90deg, rgba(200,205,215,0.18), transparent)', boxShadow: 'inset 0 0 0 1px rgba(200,205,215,0.3)' };
    if (rank === 3) return { background: 'linear-gradient(90deg, rgba(205,127,50,0.20), transparent)', boxShadow: 'inset 0 0 0 1px rgba(205,127,50,0.35)' };
    if (rank <= 10) return { background: 'rgba(255,255,255,0.035)' };
    return {};
  }
  const medal = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(6,20,10,0.65)', boxShadow: '0 6px 28px rgba(0,0,0,0.4)' }}>
      <div className="bs-section-header" style={{ background: 'linear-gradient(135deg, #2a1e02 0%, #6b5410 55%, #2a1e02 100%)' }}>
        <span className="text-base">🏆</span>
        <span className="text-amber-200 font-black tracking-wide">PLAYER LEADERBOARD</span>
        <span className="ml-auto text-[10px] font-bold text-amber-300/70 uppercase tracking-widest">Top 10 highlighted</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-amber-300/80" style={{ background: 'rgba(0,0,0,0.35)' }}>
              <th className="px-2 py-2.5 text-center w-12">Rank</th>
              <th className="px-3 py-2.5 text-left">Player</th>
              <th className="px-3 py-2.5 text-center">Team</th>
              <th className="px-2 py-2.5 text-center" title="Played">P</th>
              <th className="px-2 py-2.5 text-center" title="Won">W</th>
              <th className="px-2 py-2.5 text-center" title="Drawn">D</th>
              <th className="px-2 py-2.5 text-center" title="Lost">L</th>
              <th className="px-3 py-2.5 text-center" style={{ color: '#FFD700' }}>Pts</th>
              <th className="px-3 py-2.5 text-center w-28">Win %</th>
            </tr>
          </thead>
          <tbody>
            {playerStats.map((s, i) => {
              const rank = i + 1;
              const top3 = rank <= 3;
              const teamColor = s.team === 'A' ? colorA : colorB;
              return (
                <tr key={s.playerName} style={rowStyle(rank)} className="border-b border-white/5 transition-colors hover:bg-white/[0.06]">
                  <td className="px-2 py-2.5 text-center font-black">
                    {medal(rank) ?? <span className="text-amber-200/50">{rank}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`font-bold ${top3 ? 'text-base' : ''}`} style={{ color: top3 ? '#fff7dc' : '#f0edd6' }}>
                      {s.playerName}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{ background: `${teamColor}22`, color: teamColor, border: `1px solid ${teamColor}66` }}>
                      {s.team === 'A' ? teamAName : teamBName}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center text-amber-100/70">{s.played}</td>
                  <td className="px-2 py-2.5 text-center font-bold text-emerald-400">{s.won}</td>
                  <td className="px-2 py-2.5 text-center text-amber-200/50">{s.drawn}</td>
                  <td className="px-2 py-2.5 text-center text-red-400/80">{s.lost}</td>
                  <td className="px-3 py-2.5 text-center font-black text-base" style={{ color: '#FFD700', textShadow: top3 ? '0 0 10px rgba(255,215,0,0.5)' : 'none' }}>
                    {s.points}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${s.winPct}%`, background: 'linear-gradient(90deg,#10c86e,#4ef0a0)' }} />
                      </div>
                      <span className="font-bold text-emerald-300 w-11 text-right">{s.winPct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main StatsPanel ──────────────────────────────────────────────────────────

export default function StatsPanel({ stats, teamAName, teamBName, teamAColor, teamBColor, totalRounds }: Props) {
  const { pairStats, playerStats, progression } = stats;
  const teamAPlayers = playerStats.filter(s => s.team === 'A').map(s => s.playerName);

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
      {/* Player leaderboard first — most important at a glance */}
      <PlayerStatsTable playerStats={playerStats} teamAName={teamAName} teamBName={teamBName} colorA={teamAColor} colorB={teamBColor} />

      {/* Charts & trends below */}
      <h3 className="bs-title"><span>📊</span> Charts &amp; Trends</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <WinsByPairChart pairStats={pairStats} teamAName={teamAName} teamBName={teamBName} colorA={teamAColor} colorB={teamBColor} />
          <WinPctChart pairStats={pairStats} colorA={teamAColor} colorB={teamBColor} />
        </div>
        <div>
          <TeamSharePie pairStats={pairStats} teamAName={teamAName} teamBName={teamBName} colorA={teamAColor} colorB={teamBColor} />
          <PlayerWinPctChart playerStats={playerStats} colorA={teamAColor} colorB={teamBColor} />
        </div>
      </div>
      <PointsProgressionChart progression={progression} totalRounds={totalRounds} teamAPlayers={teamAPlayers} colorA={teamAColor} colorB={teamBColor} />
    </div>
  );
}
