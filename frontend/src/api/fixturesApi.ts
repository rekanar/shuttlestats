// ─── Firestore Cloud Sync API ─────────────────────────────────────────────────
// All data stored in Firebase Firestore.
// • Works offline — Firestore caches data locally and auto-syncs when online.
// • Same data visible on any device signed in to the same Firebase project.
// • Same API interface as before — no component changes needed.

import {
  collection, doc,
  getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import type { Fixture, CreateFixturePayload, MatchResult, StatsResponse, TournamentSummary } from '../types';
import { generateFairRoundsFixture, generateFullFixture, getFixtureSummary } from '../services/fixtureAlgorithm';
import {
  computePairStats, computePlayerStats, computeProgress,
  computePointsProgression, computeTeamStats, searchPlayer,
  type FlatMatch,
} from '../services/statsService';

// ─── Firestore collection references ─────────────────────────────────────────

const fixturesCol = () => collection(db, 'fixtures');
const matchesCol  = () => collection(db, 'matches');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getMatchesForFixture(fixtureId: string): Promise<FlatMatch[]> {
  const q = query(matchesCol(), where('fixture_id', '==', fixtureId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as FlatMatch);
}

function buildRounds(matches: FlatMatch[]) {
  const roundMap = new Map<number, any[]>();
  for (const m of matches) {
    if (!roundMap.has(m.round_number)) roundMap.set(m.round_number, []);
    roundMap.get(m.round_number)!.push({
      id: m.id, court: m.court,
      teamAPair: [m.team_a_player1, m.team_a_player2] as [string, string],
      teamBPair: [m.team_b_player1, m.team_b_player2] as [string, string],
      result: m.result, scoreA: m.score_a, scoreB: m.score_b, status: m.status,
    });
  }
  return Array.from(roundMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([roundNumber, matches]) => ({ roundNumber, matches }));
}

function serializeFixture(data: any, matches: FlatMatch[]): Fixture {
  const rounds = buildRounds(matches);
  const progress = computeProgress(matches, data.is_finished);
  return {
    id: data.id,
    tournamentName: data.tournament_name || `${data.team_a_name} vs ${data.team_b_name}`,
    teamAName: data.team_a_name,
    teamBName: data.team_b_name,
    teamAPlayers: data.team_a_players,
    teamBPlayers: data.team_b_players,
    scheduleMode: data.schedule_mode,
    courtsAvailable: data.courts_available,
    matchDurationMins: data.match_duration_mins,
    pointsScheme: { win: data.points_win, draw: data.points_draw, loss: data.points_loss },
    isFinished: !!data.is_finished,
    finishedAt: data.finished_at ?? null,
    shareToken: data.share_token,
    createdAt: data.created_at,
    rounds,
    summary: getFixtureSummary(data.team_a_players, data.team_b_players, rounds),
    progress,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const fixturesApi = {

  async list(): Promise<TournamentSummary[]> {
    const q = query(fixturesCol(), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    const results: TournamentSummary[] = [];
    for (const docSnap of snap.docs) {
      const f = docSnap.data();
      const matches = await getMatchesForFixture(f.id);
      const completed = matches.filter(m => m.status === 'completed' || m.status === 'not_played').length;
      const pct = matches.length > 0 ? Math.round((completed / matches.length) * 100) : 0;
      results.push({
        id: f.id,
        tournamentName: f.tournament_name || `${f.team_a_name} vs ${f.team_b_name}`,
        teamAName: f.team_a_name,
        teamBName: f.team_b_name,
        createdAt: f.created_at,
        isFinished: !!f.is_finished,
        totalMatches: matches.length,
        completedMatches: completed,
        pct,
      });
    }
    return results;
  },

  async get(id: string): Promise<Fixture> {
    const snap = await getDoc(doc(fixturesCol(), id));
    if (!snap.exists()) throw new Error('Tournament not found');
    const matches = await getMatchesForFixture(id);
    return serializeFixture(snap.data(), matches);
  },

  // ─── Generate a fixture locally WITHOUT saving to Firestore ────────────────
  // Call this to show the user a preview. Then call saveFixture() to persist.
  preview(payload: CreateFixturePayload): Fixture {
    const {
      tournamentName = '', teamAName, teamBName, teamAPlayers, teamBPlayers,
      scheduleMode = 'full_fixture', courtsAvailable = 4,
      matchDurationMins = 30, pointsScheme = { win: 2, draw: 1, loss: 0 },
    } = payload;

    const cleanA = [...new Set(teamAPlayers.map(p => p.trim()).filter(Boolean))];
    const cleanB = [...new Set(teamBPlayers.map(p => p.trim()).filter(Boolean))];

    const generatedRounds = scheduleMode === 'full_fixture'
      ? generateFullFixture(cleanA, cleanB, courtsAvailable)
      : generateFairRoundsFixture(cleanA, cleanB, courtsAvailable);

    if (!generatedRounds.length) throw new Error('Could not generate fixture. Check player counts.');

    const fixtureId = uuidv4();
    const now = new Date().toISOString();

    // Build FixtureRound[] with stable UUIDs for every match
    const rounds = generatedRounds.map(r => ({
      roundNumber: r.roundNumber,
      matches: r.matches.map(m => ({
        id: uuidv4(),
        court: m.court,
        teamAPair: m.teamAPair,
        teamBPair: m.teamBPair,
        result: null as import('../types').MatchResult,
        scoreA: null as string | null,
        scoreB: null as string | null,
        status: 'pending' as import('../types').MatchStatus,
      })),
    }));

    // Build FlatMatch[] just for computeProgress (all pending)
    const flatMatches: FlatMatch[] = rounds.flatMap(r =>
      r.matches.map(m => ({
        id: m.id, fixture_id: fixtureId,
        round_number: r.roundNumber, court: m.court,
        team_a_player1: m.teamAPair[0], team_a_player2: m.teamAPair[1],
        team_b_player1: m.teamBPair[0], team_b_player2: m.teamBPair[1],
        result: null, score_a: null, score_b: null, status: 'pending' as const,
      }))
    );

    return {
      id: fixtureId,
      tournamentName: (tournamentName ?? '').trim() || `${teamAName} vs ${teamBName}`,
      teamAName, teamBName,
      teamAPlayers: cleanA, teamBPlayers: cleanB,
      scheduleMode, courtsAvailable, matchDurationMins,
      pointsScheme: { win: pointsScheme.win ?? 2, draw: pointsScheme.draw ?? 1, loss: pointsScheme.loss ?? 0 },
      isFinished: false, finishedAt: null,
      shareToken: uuidv4(),
      createdAt: now,
      rounds,
      summary: getFixtureSummary(cleanA, cleanB, rounds),
      progress: computeProgress(flatMatches, 0),
    };
  },

  // ─── Persist a previewed fixture to Firestore ────────────────────────────
  async saveFixture(fixture: Fixture): Promise<void> {
    const fixtureData = {
      id: fixture.id,
      tournament_name: fixture.tournamentName,
      team_a_name: fixture.teamAName, team_b_name: fixture.teamBName,
      team_a_players: fixture.teamAPlayers, team_b_players: fixture.teamBPlayers,
      schedule_mode: fixture.scheduleMode, courts_available: fixture.courtsAvailable,
      match_duration_mins: fixture.matchDurationMins,
      points_win: fixture.pointsScheme.win, points_draw: fixture.pointsScheme.draw, points_loss: fixture.pointsScheme.loss,
      is_finished: 0, finished_at: null,
      share_token: fixture.shareToken, created_at: fixture.createdAt,
    };

    await setDoc(doc(fixturesCol(), fixture.id), fixtureData);

    for (const round of fixture.rounds) {
      for (const m of round.matches) {
        const row: FlatMatch = {
          id: m.id, fixture_id: fixture.id,
          round_number: round.roundNumber, court: m.court,
          team_a_player1: m.teamAPair[0], team_a_player2: m.teamAPair[1],
          team_b_player1: m.teamBPair[0], team_b_player2: m.teamBPair[1],
          result: null, score_a: null, score_b: null, status: 'pending' as const,
        };
        await setDoc(doc(matchesCol(), m.id), row);
      }
    }
  },

  // ─── Sync only specific changed matches to Firestore ─────────────────────
  // • If this fixture has never been saved: writes fixture doc + ALL match docs
  // • If already in Firestore: writes ONLY the dirty match docs (by ID)
  // This means a 100-match tournament where 1 result was entered → 1 Firestore write,
  // not 100. Each write is scoped to one document.
  async syncDirtyMatches(fixture: Fixture, dirtyMatchIds: string[]): Promise<void> {
    const fixtureRef = doc(fixturesCol(), fixture.id);
    const fixtureSnap = await getDoc(fixtureRef);

    const fixtureData = {
      id: fixture.id,
      tournament_name: fixture.tournamentName,
      team_a_name: fixture.teamAName, team_b_name: fixture.teamBName,
      team_a_players: fixture.teamAPlayers, team_b_players: fixture.teamBPlayers,
      schedule_mode: fixture.scheduleMode, courts_available: fixture.courtsAvailable,
      match_duration_mins: fixture.matchDurationMins,
      points_win: fixture.pointsScheme.win, points_draw: fixture.pointsScheme.draw,
      points_loss: fixture.pointsScheme.loss,
      is_finished: fixture.isFinished ? 1 : 0, finished_at: fixture.finishedAt ?? null,
      share_token: fixture.shareToken, created_at: fixture.createdAt,
    };

    if (!fixtureSnap.exists()) {
      // First time — save fixture doc + ALL match docs (skeleton)
      await setDoc(fixtureRef, fixtureData);
      for (const round of fixture.rounds) {
        for (const m of round.matches) {
          const row: FlatMatch = {
            id: m.id, fixture_id: fixture.id,
            round_number: round.roundNumber, court: m.court,
            team_a_player1: m.teamAPair[0], team_a_player2: m.teamAPair[1],
            team_b_player1: m.teamBPair[0], team_b_player2: m.teamBPair[1],
            result: m.result, score_a: m.scoreA, score_b: m.scoreB, status: m.status,
          };
          await setDoc(doc(matchesCol(), m.id), row);
        }
      }
      return;
    }

    // Fixture already exists — only write the dirty match documents
    const dirtySet = new Set(dirtyMatchIds);
    for (const round of fixture.rounds) {
      for (const m of round.matches) {
        if (!dirtySet.has(m.id)) continue;   // ← skip unchanged matches
        const row: FlatMatch = {
          id: m.id, fixture_id: fixture.id,
          round_number: round.roundNumber, court: m.court,
          team_a_player1: m.teamAPair[0], team_a_player2: m.teamAPair[1],
          team_b_player1: m.teamBPair[0], team_b_player2: m.teamBPair[1],
          result: m.result, score_a: m.scoreA, score_b: m.scoreB, status: m.status,
        };
        await setDoc(doc(matchesCol(), m.id), row);
      }
    }
  },

  async create(payload: CreateFixturePayload): Promise<Fixture> {
    const fixture = fixturesApi.preview(payload);
    await fixturesApi.saveFixture(fixture);
    return fixture;
  },

  async updateMatch(fixtureId: string, matchId: string, result: MatchResult, scoreA?: string, scoreB?: string) {
    const matchRef = doc(matchesCol(), matchId);
    const snap = await getDoc(matchRef);
    if (!snap.exists()) throw new Error('Match not found');
    const status = result === null ? 'pending' : result === 'not_played' ? 'not_played' : 'completed';
    const updates = { result, score_a: scoreA ?? null, score_b: scoreB ?? null, status, entered_at: new Date().toISOString() };
    await updateDoc(matchRef, updates);
    const allMatches = await getMatchesForFixture(fixtureId);
    const fixtureSnap = await getDoc(doc(fixturesCol(), fixtureId));
    return {
      matchId, result, scoreA, scoreB, status,
      progress: computeProgress(allMatches, fixtureSnap.data()?.is_finished ?? 0),
    };
  },

  async startMatch(fixtureId: string, matchId: string) {
    const matchRef = doc(matchesCol(), matchId);
    const snap = await getDoc(matchRef);
    if (!snap.exists()) throw new Error('Match not found');
    const current = snap.data();
    const newStatus = current.status === 'in_progress' ? 'pending' : 'in_progress';
    await updateDoc(matchRef, { status: newStatus });
    const allMatches = await getMatchesForFixture(fixtureId);
    const fixtureSnap = await getDoc(doc(fixturesCol(), fixtureId));
    return {
      matchId, status: newStatus,
      progress: computeProgress(allMatches, fixtureSnap.data()?.is_finished ?? 0),
    };
  },

  async getStats(id: string): Promise<StatsResponse> {
    const snap = await getDoc(doc(fixturesCol(), id));
    if (!snap.exists()) throw new Error('Tournament not found');
    const f = snap.data();
    const matches = await getMatchesForFixture(id);
    const pts = { win: f.points_win, draw: f.points_draw, loss: f.points_loss };
    const rounds = buildRounds(matches);
    return {
      pairStats: computePairStats(matches, pts),
      playerStats: computePlayerStats(matches, { win: 10, draw: 5, loss: 0 }),
      progress: computeProgress(matches, f.is_finished),
      progression: computePointsProgression(matches, pts, rounds.length),
      teamStats: computeTeamStats(matches),
    };
  },

  async search(id: string, q: string) {
    const matches = await getMatchesForFixture(id);
    if (!q.trim()) return { matches: [], pending: [], completed: [], notPlayed: [], partnerships: [] };
    return searchPlayer(q, matches);
  },

  async finish(id: string): Promise<Fixture> {
    const ref = doc(fixturesCol(), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Tournament not found');
    const now = new Date().toISOString();
    await updateDoc(ref, { is_finished: 1, finished_at: now });
    const matches = await getMatchesForFixture(id);
    return serializeFixture({ ...snap.data(), is_finished: 1, finished_at: now }, matches);
  },

  async delete(id: string): Promise<void> {
    // Delete all match docs in parallel, then the fixture doc
    const q = query(matchesCol(), where('fixture_id', '==', id));
    const matchSnap = await getDocs(q);
    await Promise.all(matchSnap.docs.map(m => deleteDoc(m.ref)));
    await deleteDoc(doc(fixturesCol(), id));
  },

  // ─── Delete a single match document from Firestore ────────────────────────
  async deleteMatch(matchId: string): Promise<void> {
    const ref = doc(matchesCol(), matchId);
    const snap = await getDoc(ref);
    if (snap.exists()) await deleteDoc(ref);
    // If the match was never saved to Firestore it just won't exist — that's fine
  },

  async updatePointsScheme(id: string, scheme: { win: number; draw: number; loss: number }) {
    await updateDoc(doc(fixturesCol(), id), {
      points_win: scheme.win, points_draw: scheme.draw, points_loss: scheme.loss,
    });
    return scheme;
  },

  // ─── Export all data to JSON (backup) ─────────────────────────────────────
  async exportAll(): Promise<string> {
    const fixtureSnap = await getDocs(fixturesCol());
    const matchSnap   = await getDocs(matchesCol());
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      fixtures: fixtureSnap.docs.map(d => d.data()),
      matches:  matchSnap.docs.map(d => d.data()),
    };
    return JSON.stringify(backup, null, 2);
  },

  // ─── Import from JSON backup (restore) ────────────────────────────────────
  async importAll(jsonStr: string): Promise<number> {
    let backup: any;
    try { backup = JSON.parse(jsonStr); } catch { throw new Error('Invalid backup file — could not parse JSON.'); }
    if (!backup.fixtures || !backup.matches) throw new Error('Invalid backup file — missing fixtures or matches.');
    let count = 0;
    for (const f of backup.fixtures) {
      await setDoc(doc(fixturesCol(), f.id), f);
      count++;
    }
    for (const m of backup.matches) {
      await setDoc(doc(matchesCol(), m.id), m);
    }
    return count;
  },
};
