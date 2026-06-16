// ─── Fixture Generation Algorithm (ported from backend) ───────────────────────

export type GeneratedMatch = {
  court: number;
  teamAPair: [string, string];
  teamBPair: [string, string];
  status: 'pending';
  result: null;
  scoreA: null;
  scoreB: null;
};

export type GeneratedRound = {
  roundNumber: number;
  matches: GeneratedMatch[];
};

function getAllPairs(players: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < players.length; i++)
    for (let j = i + 1; j < players.length; j++)
      pairs.push([players[i], players[j]]);
  return pairs;
}

function generate1Factorization(players: string[]): [string, string][][] {
  if (players.length < 2) return [];
  const list = [...players];
  if (list.length % 2 !== 0) list.push('__bye__');
  const n = list.length;
  const fixed = list[n - 1];
  const rotating = list.slice(0, n - 1);
  const rounds: [string, string][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs: [string, string][] = [];
    const rp = rotating[r % (n - 1)];
    if (fixed !== '__bye__' && rp !== '__bye__') pairs.push([fixed, rp]);
    for (let i = 1; i < n / 2; i++) {
      const p1 = rotating[(r + i) % (n - 1)];
      const p2 = rotating[(r + n - 1 - i) % (n - 1)];
      if (p1 !== '__bye__' && p2 !== '__bye__') pairs.push([p1, p2]);
    }
    if (pairs.length > 0) rounds.push(pairs);
  }
  return rounds;
}

function scheduleIntoRounds(
  matchups: { teamAPair: [string, string]; teamBPair: [string, string] }[],
  courtsAvailable: number
) {
  const rounds: typeof matchups[] = [];
  const remaining = [...matchups];
  while (remaining.length > 0) {
    const roundMatches: typeof matchups = [];
    const busy = new Set<string>();
    const unscheduled: typeof matchups = [];
    for (const m of remaining) {
      const players = [...m.teamAPair, ...m.teamBPair];
      if (roundMatches.length < courtsAvailable && !players.some(p => busy.has(p))) {
        roundMatches.push(m);
        players.forEach(p => busy.add(p));
      } else {
        unscheduled.push(m);
      }
    }
    rounds.push(roundMatches);
    remaining.splice(0, remaining.length, ...unscheduled);
  }
  return rounds;
}

export function generateFairRoundsFixture(
  teamAPlayers: string[], teamBPlayers: string[], courtsAvailable: number
): GeneratedRound[] {
  const aRounds = generate1Factorization(teamAPlayers);
  const bRounds = generate1Factorization(teamBPlayers);
  if (!aRounds.length || !bRounds.length) return [];
  const totalRounds = Math.max(aRounds.length, bRounds.length);
  const fixtureRounds: GeneratedRound[] = [];
  for (let r = 0; r < totalRounds; r++) {
    const aPairs = aRounds[r % aRounds.length];
    const bRoundIdx = (r + Math.floor(bRounds.length / 2)) % bRounds.length;
    const bPairs = bRounds[bRoundIdx];
    const numMatches = Math.min(aPairs.length, bPairs.length, courtsAvailable);
    const matches: GeneratedMatch[] = [];
    for (let m = 0; m < numMatches; m++) {
      const bIdx = (m + r) % bPairs.length;
      matches.push({ court: m + 1, teamAPair: aPairs[m] as [string,string], teamBPair: bPairs[bIdx] as [string,string], status: 'pending', result: null, scoreA: null, scoreB: null });
    }
    fixtureRounds.push({ roundNumber: r + 1, matches });
  }
  return fixtureRounds;
}

export function generateFullFixture(
  teamAPlayers: string[], teamBPlayers: string[], courtsAvailable: number
): GeneratedRound[] {
  const aPairs = getAllPairs(teamAPlayers);
  const bPairs = getAllPairs(teamBPlayers);
  const matchups = aPairs.flatMap(ap => bPairs.map(bp => ({ teamAPair: ap, teamBPair: bp })));
  const rawRounds = scheduleIntoRounds(matchups, courtsAvailable);
  return rawRounds.map((matches, idx) => ({
    roundNumber: idx + 1,
    matches: matches.map((m, mIdx) => ({
      court: mIdx + 1,
      teamAPair: m.teamAPair as [string, string],
      teamBPair: m.teamBPair as [string, string],
      status: 'pending' as const,
      result: null,
      scoreA: null,
      scoreB: null,
    })),
  }));
}

export function getFixtureSummary(
  teamAPlayers: string[], teamBPlayers: string[],
  rounds: { matches: { teamAPair: [string,string]; teamBPair: [string,string] }[] }[]
) {
  const totalMatches = rounds.reduce((s, r) => s + r.matches.length, 0);
  const playerMatchCount: Record<string, number> = {};
  for (const p of [...teamAPlayers, ...teamBPlayers]) playerMatchCount[p] = 0;
  for (const round of rounds)
    for (const m of round.matches)
      [...m.teamAPair, ...m.teamBPair].forEach(p => { if (playerMatchCount[p] !== undefined) playerMatchCount[p]++; });
  const counts = Object.values(playerMatchCount);
  return {
    totalRounds: rounds.length,
    totalMatches,
    matchesPerPlayer: counts.length ? `${Math.min(...counts)}–${Math.max(...counts)}` : '0',
    playerMatchCount,
  };
}
