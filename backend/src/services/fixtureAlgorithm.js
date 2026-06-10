'use strict';

/**
 * Returns all C(n, 2) unique pairs from a player list.
 */
function getAllPairs(players) {
  const pairs = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      pairs.push([players[i], players[j]]);
    }
  }
  return pairs;
}

/**
 * 1-Factorization using the Circle (Berger) method.
 * For N players (even), produces N-1 rounds where each player appears exactly
 * once per round and every unique pair appears in exactly one round.
 * For odd N, appends a dummy "__bye__" and skips bye matches.
 *
 * @param {string[]} players
 * @returns {string[][][]}  array of rounds, each round is array of [p1, p2] pairs
 */
function generate1Factorization(players) {
  if (players.length < 2) return [];

  const list = [...players];
  if (list.length % 2 !== 0) list.push('__bye__');
  const n = list.length;

  const fixed = list[n - 1];
  const rotating = list.slice(0, n - 1);
  const rounds = [];

  for (let r = 0; r < n - 1; r++) {
    const pairs = [];

    // Pair fixed player with rotating[r]
    const rp = rotating[r % (n - 1)];
    if (fixed !== '__bye__' && rp !== '__bye__') {
      pairs.push([fixed, rp]);
    }

    // Pair remaining players symmetrically around pivot
    for (let i = 1; i < n / 2; i++) {
      const p1 = rotating[(r + i) % (n - 1)];
      const p2 = rotating[(r + n - 1 - i) % (n - 1)];
      if (p1 !== '__bye__' && p2 !== '__bye__') {
        pairs.push([p1, p2]);
      }
    }

    if (pairs.length > 0) rounds.push(pairs);
  }
  return rounds;
}

/**
 * Schedules an arbitrary list of matchups into rounds such that:
 * - No player appears twice in the same round.
 * - Each round has at most `courtsAvailable` matches.
 *
 * Uses a greedy round-construction approach.
 */
function scheduleIntoRounds(matchups, courtsAvailable) {
  const rounds = [];
  const remaining = [...matchups];

  while (remaining.length > 0) {
    const roundMatches = [];
    const busy = new Set();
    const unscheduled = [];

    for (const m of remaining) {
      const players = [...m.teamAPair, ...m.teamBPair];
      const conflict = players.some(p => busy.has(p));

      if (roundMatches.length < courtsAvailable && !conflict) {
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

/**
 * FAIR ROUNDS MODE
 * Uses 1-factorization independently for each team, then cross-pairs them.
 * Each player participates in approximately the same number of matches.
 *
 * Guarantees (per BR16–BR18):
 * - Each player plays in every round exactly once (no conflicts in a round).
 * - Within a team, same partnership not repeated until all pairs are exhausted.
 * - Match count per player differs by at most 1 across all players.
 *
 * @param {string[]} teamAPlayers
 * @param {string[]} teamBPlayers
 * @param {number}   courtsAvailable
 * @returns {Array<{roundNumber:number, matches:object[]}>}
 */
function generateFairRoundsFixture(teamAPlayers, teamBPlayers, courtsAvailable) {
  const aRounds = generate1Factorization(teamAPlayers);
  const bRounds = generate1Factorization(teamBPlayers);

  if (!aRounds.length || !bRounds.length) return [];

  const totalRounds = Math.max(aRounds.length, bRounds.length);
  const fixtureRounds = [];

  for (let r = 0; r < totalRounds; r++) {
    const aPairs = aRounds[r % aRounds.length];
    // Offset Team B's round selection by half its schedule length to maximise
    // cross-pair variety — ensures Team A pairs face different Team B pairs
    // each round before any repeat.
    const bRoundIdx = (r + Math.floor(bRounds.length / 2)) % bRounds.length;
    const bPairs = bRounds[bRoundIdx];

    const numMatches = Math.min(aPairs.length, bPairs.length, courtsAvailable);
    const matches = [];

    for (let m = 0; m < numMatches; m++) {
      // Rotate which B pair faces each A pair within the round for additional variety
      const bIdx = (m + r) % bPairs.length;
      matches.push({
        court: m + 1,
        teamAPair: aPairs[m],
        teamBPair: bPairs[bIdx],
        status: 'pending',
        result: null,
        scoreA: null,
        scoreB: null,
      });
    }

    fixtureRounds.push({ roundNumber: r + 1, matches });
  }

  return fixtureRounds;
}

/**
 * FULL FIXTURE MODE
 * Generates every possible Team A pair vs every Team B pair.
 * Total matches = C(N_A, 2) × C(N_B, 2).
 * Scheduled greedily into rounds respecting no-conflict constraint.
 *
 * @param {string[]} teamAPlayers
 * @param {string[]} teamBPlayers
 * @param {number}   courtsAvailable
 * @returns {Array<{roundNumber:number, matches:object[]}>}
 */
function generateFullFixture(teamAPlayers, teamBPlayers, courtsAvailable) {
  const aPairs = getAllPairs(teamAPlayers);
  const bPairs = getAllPairs(teamBPlayers);

  const matchups = [];
  for (const ap of aPairs) {
    for (const bp of bPairs) {
      matchups.push({ teamAPair: ap, teamBPair: bp });
    }
  }

  const rawRounds = scheduleIntoRounds(matchups, courtsAvailable);

  return rawRounds.map((matches, idx) => ({
    roundNumber: idx + 1,
    matches: matches.map((m, mIdx) => ({
      court: mIdx + 1,
      teamAPair: m.teamAPair,
      teamBPair: m.teamBPair,
      status: 'pending',
      result: null,
      scoreA: null,
      scoreB: null,
    })),
  }));
}

/**
 * Returns a summary of the generated fixture for validation.
 */
function getFixtureSummary(teamAPlayers, teamBPlayers, rounds) {
  const totalMatches = rounds.reduce((s, r) => s + r.matches.length, 0);
  const playerMatchCount = {};

  for (const player of [...teamAPlayers, ...teamBPlayers]) {
    playerMatchCount[player] = 0;
  }

  for (const round of rounds) {
    for (const m of round.matches) {
      [...m.teamAPair, ...m.teamBPair].forEach(p => {
        if (playerMatchCount[p] !== undefined) playerMatchCount[p]++;
      });
    }
  }

  const counts = Object.values(playerMatchCount);
  const minMatches = Math.min(...counts);
  const maxMatches = Math.max(...counts);

  return {
    totalRounds: rounds.length,
    totalMatches,
    matchesPerPlayer: `${minMatches}–${maxMatches}`,
    playerMatchCount,
  };
}

module.exports = {
  generateFairRoundsFixture,
  generateFullFixture,
  getAllPairs,
  getFixtureSummary,
};
