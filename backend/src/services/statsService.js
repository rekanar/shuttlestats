'use strict';

/**
 * Computes per-pair statistics from a set of match results.
 * @param {object[]} matches - flat array of match_result rows from DB
 * @param {{win:number,draw:number,loss:number}} pts
 * @returns {object[]}
 */
function computePairStats(matches, pts) {
  const map = new Map();

  function ensure(key, team, players) {
    if (!map.has(key)) {
      map.set(key, { pairKey: key, team, players, played: 0, won: 0, lost: 0, drawn: 0, points: 0 });
    }
    return map.get(key);
  }

  for (const m of matches) {
    const aKey = pairKey(m.team_a_player1, m.team_a_player2);
    const bKey = pairKey(m.team_b_player1, m.team_b_player2);
    const aStats = ensure(aKey, 'A', [m.team_a_player1, m.team_a_player2]);
    const bStats = ensure(bKey, 'B', [m.team_b_player1, m.team_b_player2]);

    if (m.status === 'not_played' || m.status === 'pending') continue;

    aStats.played++;
    bStats.played++;

    if (m.result === 'a_win') {
      aStats.won++;    aStats.points += pts.win;
      bStats.lost++;   bStats.points += pts.loss;
    } else if (m.result === 'b_win') {
      bStats.won++;    bStats.points += pts.win;
      aStats.lost++;   aStats.points += pts.loss;
    } else if (m.result === 'draw') {
      aStats.drawn++;  aStats.points += pts.draw;
      bStats.drawn++;  bStats.points += pts.draw;
    }
  }

  return Array.from(map.values())
    .map(s => ({ ...s, winPct: s.played > 0 ? +((s.won / s.played) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.points - a.points || b.winPct - a.winPct || b.played - a.played);
}

/**
 * Computes per-player statistics by aggregating across all pairs.
 * A player earns the points of any pair they belong to.
 */
function computePlayerStats(matches, pts) {
  const map = new Map();

  function ensure(name, team) {
    if (!map.has(name)) {
      map.set(name, { playerName: name, team, played: 0, won: 0, lost: 0, drawn: 0, points: 0 });
    }
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
    .sort((a, b) => b.points - a.points || b.winPct - a.winPct);
}

/**
 * Computes per-player cumulative points progression round by round.
 * Returns: { [playerName]: number[] } where index is round (0-based).
 */
function computePointsProgression(matches, pts, totalRounds) {
  const progression = {};

  // Collect unique players
  for (const m of matches) {
    [m.team_a_player1, m.team_a_player2, m.team_b_player1, m.team_b_player2].forEach(p => {
      if (!progression[p]) progression[p] = new Array(totalRounds).fill(0);
    });
  }

  // Group matches by round
  const byRound = {};
  for (const m of matches) {
    if (!byRound[m.round_number]) byRound[m.round_number] = [];
    byRound[m.round_number].push(m);
  }

  // Accumulate round by round
  const cumulative = {};
  for (const p of Object.keys(progression)) cumulative[p] = 0;

  for (let r = 1; r <= totalRounds; r++) {
    for (const m of (byRound[r] || [])) {
      if (m.status === 'not_played' || m.status === 'pending') continue;
      const aPlayers = [m.team_a_player1, m.team_a_player2];
      const bPlayers = [m.team_b_player1, m.team_b_player2];

      if (m.result === 'a_win') {
        aPlayers.forEach(p => { if (cumulative[p] !== undefined) cumulative[p] += pts.win; });
        bPlayers.forEach(p => { if (cumulative[p] !== undefined) cumulative[p] += pts.loss; });
      } else if (m.result === 'b_win') {
        bPlayers.forEach(p => { if (cumulative[p] !== undefined) cumulative[p] += pts.win; });
        aPlayers.forEach(p => { if (cumulative[p] !== undefined) cumulative[p] += pts.loss; });
      } else if (m.result === 'draw') {
        [...aPlayers, ...bPlayers].forEach(p => { if (cumulative[p] !== undefined) cumulative[p] += pts.draw; });
      }
    }
    for (const p of Object.keys(progression)) {
      progression[p][r - 1] = cumulative[p];
    }
  }

  return progression;
}

/**
 * Computes overall fixture progress.
 */
function computeProgress(matches, isFinished) {
  const total = matches.length;
  const completed = matches.filter(m => m.status === 'completed').length;
  const notPlayed = matches.filter(m => m.status === 'not_played').length;
  const pending = matches.filter(m => m.status === 'pending').length;
  const pct = total > 0 ? Math.round(((completed + notPlayed) / total) * 100) : 0;
  return { total, completed, notPlayed, pending, pct, isFinished: !!isFinished };
}

/**
 * Player search: finds all matches involving a player, grouped by status.
 * Also computes partnership stats and opponent encounter list.
 */
function searchPlayer(query, matches) {
  const q = query.toLowerCase();

  const playerMatches = matches.filter(m =>
    [m.team_a_player1, m.team_a_player2, m.team_b_player1, m.team_b_player2]
      .some(p => p.toLowerCase().includes(q))
  );

  const pending   = playerMatches.filter(m => m.status === 'pending');
  const completed = playerMatches.filter(m => m.status === 'completed');
  const notPlayed = playerMatches.filter(m => m.status === 'not_played');

  // Partnership stats: who does the searched player partner with?
  const partnerMap = new Map();
  for (const m of playerMatches) {
    if (m.status === 'not_played' || m.status === 'pending') continue;
    const aPlayers = [m.team_a_player1, m.team_a_player2];
    const bPlayers = [m.team_b_player1, m.team_b_player2];
    const allTeams = [aPlayers, bPlayers];

    for (const teamPlayers of allTeams) {
      const match = teamPlayers.some(p => p.toLowerCase().includes(q));
      if (match) {
        const partner = teamPlayers.find(p => !p.toLowerCase().includes(q));
        if (partner) {
          if (!partnerMap.has(partner)) {
            partnerMap.set(partner, { partner, played: 0, won: 0, lost: 0 });
          }
          const ps = partnerMap.get(partner);
          ps.played++;
          const isATeam = teamPlayers === aPlayers;
          if ((isATeam && m.result === 'a_win') || (!isATeam && m.result === 'b_win')) ps.won++;
          else if (m.result !== 'draw') ps.lost++;
        }
      }
    }
  }
  const partnerships = Array.from(partnerMap.values()).map(p => ({
    ...p,
    winPct: p.played > 0 ? +((p.won / p.played) * 100).toFixed(1) : 0,
  }));

  return { matches: playerMatches, pending, completed, notPlayed, partnerships };
}

function pairKey(p1, p2) {
  return [p1, p2].sort().join(' & ');
}

/**
 * Computes team-level scores: 20 pts per team win, 10 pts each team on draw.
 * Separate from configurable pair points.
 */
function computeTeamStats(matches) {
  const a = { wins: 0, losses: 0, draws: 0, points: 0, played: 0 };
  const b = { wins: 0, losses: 0, draws: 0, points: 0, played: 0 };
  for (const m of matches) {
    if (m.status !== 'completed') continue;
    a.played++; b.played++;
    if (m.result === 'a_win') {
      a.wins++; a.points += 20; b.losses++;
    } else if (m.result === 'b_win') {
      b.wins++; b.points += 20; a.losses++;
    } else if (m.result === 'draw') {
      a.draws++; a.points += 10;
      b.draws++; b.points += 10;
    }
  }
  return { teamA: a, teamB: b };
}

module.exports = { computePairStats, computePlayerStats, computeProgress, computePointsProgression, searchPlayer, computeTeamStats };
