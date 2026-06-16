// ─── Stats Service (ported from backend) ──────────────────────────────────────

export interface FlatMatch {
  id: string;
  fixture_id: string;
  round_number: number;
  court: number;
  team_a_player1: string;
  team_a_player2: string;
  team_b_player1: string;
  team_b_player2: string;
  result: string | null;
  score_a: string | null;
  score_b: string | null;
  status: string;
}

function pairKey(p1: string, p2: string) { return [p1, p2].sort().join(' & '); }

export function computePairStats(matches: FlatMatch[], pts: { win: number; draw: number; loss: number }) {
  const map = new Map<string, any>();
  function ensure(key: string, team: string, players: string[]) {
    if (!map.has(key)) map.set(key, { pairKey: key, team, players, played: 0, won: 0, lost: 0, drawn: 0, points: 0 });
    return map.get(key);
  }
  for (const m of matches) {
    const aKey = pairKey(m.team_a_player1, m.team_a_player2);
    const bKey = pairKey(m.team_b_player1, m.team_b_player2);
    const aStats = ensure(aKey, 'A', [m.team_a_player1, m.team_a_player2]);
    const bStats = ensure(bKey, 'B', [m.team_b_player1, m.team_b_player2]);
    if (m.status === 'not_played' || m.status === 'pending') continue;
    aStats.played++; bStats.played++;
    if (m.result === 'a_win') { aStats.won++; aStats.points += pts.win; bStats.lost++; bStats.points += pts.loss; }
    else if (m.result === 'b_win') { bStats.won++; bStats.points += pts.win; aStats.lost++; aStats.points += pts.loss; }
    else if (m.result === 'draw') { aStats.drawn++; aStats.points += pts.draw; bStats.drawn++; bStats.points += pts.draw; }
  }
  return Array.from(map.values())
    .map(s => ({ ...s, winPct: s.played > 0 ? +((s.won / s.played) * 100).toFixed(1) : 0 }))
    .sort((a: any, b: any) => b.points - a.points || b.winPct - a.winPct || b.played - a.played);
}

export function computePlayerStats(matches: FlatMatch[], pts: { win: number; draw: number; loss: number }) {
  const map = new Map<string, any>();
  function ensure(name: string, team: string) {
    if (!map.has(name)) map.set(name, { playerName: name, team, played: 0, won: 0, lost: 0, drawn: 0, points: 0 });
    return map.get(name);
  }
  for (const m of matches) {
    const aPlayers = [m.team_a_player1, m.team_a_player2];
    const bPlayers = [m.team_b_player1, m.team_b_player2];
    aPlayers.forEach(p => ensure(p, 'A'));
    bPlayers.forEach(p => ensure(p, 'B'));
    if (m.status === 'not_played' || m.status === 'pending') continue;
    aPlayers.forEach(p => { ensure(p, 'A').played++; });
    bPlayers.forEach(p => { ensure(p, 'B').played++; });
    if (m.result === 'a_win') {
      aPlayers.forEach(p => { const s = map.get(p); s.won++; s.points += pts.win; });
      bPlayers.forEach(p => { const s = map.get(p); s.lost++; s.points += pts.loss; });
    } else if (m.result === 'b_win') {
      bPlayers.forEach(p => { const s = map.get(p); s.won++; s.points += pts.win; });
      aPlayers.forEach(p => { const s = map.get(p); s.lost++; s.points += pts.loss; });
    } else if (m.result === 'draw') {
      [...aPlayers, ...bPlayers].forEach(p => { const s = map.get(p); s.drawn++; s.points += pts.draw; });
    }
  }
  return Array.from(map.values())
    .map(s => ({ ...s, winPct: s.played > 0 ? +((s.won / s.played) * 100).toFixed(1) : 0 }))
    .sort((a: any, b: any) => b.points - a.points || b.winPct - a.winPct);
}

export function computeProgress(matches: FlatMatch[], isFinished: boolean | number) {
  const total = matches.length;
  const completed = matches.filter(m => m.status === 'completed').length;
  const notPlayed = matches.filter(m => m.status === 'not_played').length;
  const inProgress = matches.filter(m => m.status === 'in_progress').length;
  const pending = matches.filter(m => m.status === 'pending').length;
  const pct = total > 0 ? Math.round(((completed + notPlayed) / total) * 100) : 0;
  return { total, completed, notPlayed, inProgress, pending, pct, isFinished: !!isFinished };
}

export function computePointsProgression(matches: FlatMatch[], pts: { win: number; draw: number; loss: number }, totalRounds: number) {
  const progression: Record<string, number[]> = {};
  for (const m of matches)
    [m.team_a_player1, m.team_a_player2, m.team_b_player1, m.team_b_player2].forEach(p => {
      if (!progression[p]) progression[p] = new Array(totalRounds).fill(0);
    });
  const byRound: Record<number, FlatMatch[]> = {};
  for (const m of matches) { if (!byRound[m.round_number]) byRound[m.round_number] = []; byRound[m.round_number].push(m); }
  const cumulative: Record<string, number> = {};
  for (const p of Object.keys(progression)) cumulative[p] = 0;
  for (let r = 1; r <= totalRounds; r++) {
    for (const m of (byRound[r] || [])) {
      if (m.status === 'not_played' || m.status === 'pending') continue;
      const aP = [m.team_a_player1, m.team_a_player2];
      const bP = [m.team_b_player1, m.team_b_player2];
      if (m.result === 'a_win') { aP.forEach(p => { if (cumulative[p] !== undefined) cumulative[p] += pts.win; }); bP.forEach(p => { if (cumulative[p] !== undefined) cumulative[p] += pts.loss; }); }
      else if (m.result === 'b_win') { bP.forEach(p => { if (cumulative[p] !== undefined) cumulative[p] += pts.win; }); aP.forEach(p => { if (cumulative[p] !== undefined) cumulative[p] += pts.loss; }); }
      else if (m.result === 'draw') { [...aP, ...bP].forEach(p => { if (cumulative[p] !== undefined) cumulative[p] += pts.draw; }); }
    }
    for (const p of Object.keys(progression)) progression[p][r - 1] = cumulative[p];
  }
  return progression;
}

export function computeTeamStats(matches: FlatMatch[]) {
  const a = { wins: 0, losses: 0, draws: 0, points: 0, played: 0 };
  const b = { wins: 0, losses: 0, draws: 0, points: 0, played: 0 };
  for (const m of matches) {
    if (m.status !== 'completed') continue;
    a.played++; b.played++;
    if (m.result === 'a_win') { a.wins++; a.points += 20; b.losses++; }
    else if (m.result === 'b_win') { b.wins++; b.points += 20; a.losses++; }
    else if (m.result === 'draw') { a.draws++; a.points += 10; b.draws++; b.points += 10; }
  }
  return { teamA: a, teamB: b };
}

export function searchPlayer(query: string, matches: FlatMatch[]) {
  const q = query.toLowerCase();
  const playerMatches = matches.filter(m =>
    [m.team_a_player1, m.team_a_player2, m.team_b_player1, m.team_b_player2].some(p => p.toLowerCase().includes(q))
  );
  const pending = playerMatches.filter(m => m.status === 'pending');
  const completed = playerMatches.filter(m => m.status === 'completed');
  const notPlayed = playerMatches.filter(m => m.status === 'not_played');
  const partnerMap = new Map<string, any>();
  for (const m of playerMatches) {
    if (m.status === 'not_played' || m.status === 'pending') continue;
    const aPlayers = [m.team_a_player1, m.team_a_player2];
    const bPlayers = [m.team_b_player1, m.team_b_player2];
    for (const teamPlayers of [aPlayers, bPlayers]) {
      if (teamPlayers.some(p => p.toLowerCase().includes(q))) {
        const partner = teamPlayers.find(p => !p.toLowerCase().includes(q));
        if (partner) {
          if (!partnerMap.has(partner)) partnerMap.set(partner, { partner, played: 0, won: 0, lost: 0 });
          const ps = partnerMap.get(partner);
          ps.played++;
          const isA = teamPlayers === aPlayers;
          if ((isA && m.result === 'a_win') || (!isA && m.result === 'b_win')) ps.won++;
          else if (m.result !== 'draw') ps.lost++;
        }
      }
    }
  }
  return { matches: playerMatches, pending, completed, notPlayed, partnerships: Array.from(partnerMap.values()).map(p => ({ ...p, winPct: p.played > 0 ? +((p.won / p.played) * 100).toFixed(1) : 0 })) };
}
