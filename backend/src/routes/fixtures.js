'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbGet, dbAll, dbRun, dbExec } = require('../db');
const { generateFairRoundsFixture, generateFullFixture, getFixtureSummary } = require('../services/fixtureAlgorithm');
const { computePairStats, computePlayerStats, computeProgress, computePointsProgression, searchPlayer, computeTeamStats } = require('../services/statsService');

const router = express.Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getFixtureOrThrow(id) {
  const fixture = await dbGet('SELECT * FROM team_fixtures WHERE id = ?', [id]);
  if (!fixture) {
    const err = new Error('Fixture not found');
    err.status = 404;
    throw err;
  }
  return fixture;
}

async function getMatches(fixtureId) {
  return dbAll(
    'SELECT * FROM match_results WHERE fixture_id = ? ORDER BY round_number, court',
    [fixtureId]
  );
}

function buildRounds(matches) {
  const roundMap = new Map();
  for (const m of matches) {
    if (!roundMap.has(m.round_number)) roundMap.set(m.round_number, []);
    roundMap.get(m.round_number).push({
      id: m.id,
      court: m.court,
      teamAPair: [m.team_a_player1, m.team_a_player2],
      teamBPair: [m.team_b_player1, m.team_b_player2],
      result: m.result,
      scoreA: m.score_a,
      scoreB: m.score_b,
      status: m.status,
    });
  }
  return Array.from(roundMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([roundNumber, matches]) => ({ roundNumber, matches }));
}

function serializeFixture(fixture, matches) {
  const rounds = buildRounds(matches);
  const progress = computeProgress(matches, fixture.is_finished);
  return {
    id: fixture.id,
    teamAName: fixture.team_a_name,
    teamBName: fixture.team_b_name,
    teamAPlayers: JSON.parse(fixture.team_a_players),
    teamBPlayers: JSON.parse(fixture.team_b_players),
    scheduleMode: fixture.schedule_mode,
    courtsAvailable: fixture.courts_available,
    matchDurationMins: fixture.match_duration_mins,
    pointsScheme: { win: fixture.points_win, draw: fixture.points_draw, loss: fixture.points_loss },
    isFinished: !!fixture.is_finished,
    finishedAt: fixture.finished_at,
    shareToken: fixture.share_token,
    createdAt: fixture.created_at,
    rounds,
    summary: getFixtureSummary(JSON.parse(fixture.team_a_players), JSON.parse(fixture.team_b_players), rounds),
    progress,
  };
}

// ─── POST /api/fixtures ───────────────────────────────────────────────────────

router.post('/', async (req, res, next) => {
  try {
    const {
      teamAName, teamBName, teamAPlayers, teamBPlayers,
      scheduleMode = 'fair_rounds',
      courtsAvailable = 4,
      matchDurationMins = 30,
      pointsScheme = { win: 2, draw: 1, loss: 0 },
    } = req.body;

    if (!teamAName || !teamBName) return res.status(400).json({ error: 'teamAName and teamBName are required' });
    if (!Array.isArray(teamAPlayers) || teamAPlayers.length < 4) return res.status(400).json({ error: 'teamAPlayers must have at least 4 players' });
    if (!Array.isArray(teamBPlayers) || teamBPlayers.length < 4) return res.status(400).json({ error: 'teamBPlayers must have at least 4 players' });
    if (teamAPlayers.length > 20 || teamBPlayers.length > 20) return res.status(400).json({ error: 'Maximum 20 players per team' });

    const cleanA = [...new Set(teamAPlayers.map(p => p.trim()).filter(Boolean))];
    const cleanB = [...new Set(teamBPlayers.map(p => p.trim()).filter(Boolean))];

    const generatedRounds = scheduleMode === 'full_fixture'
      ? generateFullFixture(cleanA, cleanB, courtsAvailable)
      : generateFairRoundsFixture(cleanA, cleanB, courtsAvailable);

    if (!generatedRounds.length) return res.status(400).json({ error: 'Could not generate fixture. Check player counts.' });

    const fixtureId = uuidv4();
    const shareToken = uuidv4();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO team_fixtures
        (id, team_a_name, team_b_name, team_a_players, team_b_players,
         schedule_mode, courts_available, match_duration_mins,
         points_win, points_draw, points_loss, share_token, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [fixtureId, teamAName, teamBName,
       JSON.stringify(cleanA), JSON.stringify(cleanB),
       scheduleMode, courtsAvailable, matchDurationMins,
       pointsScheme.win ?? 2, pointsScheme.draw ?? 1, pointsScheme.loss ?? 0,
       shareToken, now]
    );

    // Insert all match rows in a transaction
    await dbExec('BEGIN');
    try {
      for (const round of generatedRounds) {
        for (const m of round.matches) {
          await dbRun(
            `INSERT INTO match_results
              (id, fixture_id, round_number, court,
               team_a_player1, team_a_player2, team_b_player1, team_b_player2)
             VALUES (?,?,?,?,?,?,?,?)`,
            [uuidv4(), fixtureId, round.roundNumber, m.court,
             m.teamAPair[0], m.teamAPair[1], m.teamBPair[0], m.teamBPair[1]]
          );
        }
      }
      await dbExec('COMMIT');
    } catch (txErr) {
      await dbExec('ROLLBACK');
      throw txErr;
    }

    const matches = await getMatches(fixtureId);
    const fixture = await dbGet('SELECT * FROM team_fixtures WHERE id = ?', [fixtureId]);
    res.status(201).json(serializeFixture(fixture, matches));
  } catch (err) { next(err); }
});

// ─── GET /api/fixtures/:id ────────────────────────────────────────────────────

router.get('/:id', async (req, res, next) => {
  try {
    const fixture = await getFixtureOrThrow(req.params.id);
    const matches = await getMatches(fixture.id);
    res.json(serializeFixture(fixture, matches));
  } catch (err) { next(err); }
});

// ─── GET /api/fixtures/share/:token ──────────────────────────────────────────

router.get('/share/:token', async (req, res, next) => {
  try {
    const fixture = await dbGet('SELECT * FROM team_fixtures WHERE share_token = ?', [req.params.token]);
    if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
    const matches = await getMatches(fixture.id);
    res.json(serializeFixture(fixture, matches));
  } catch (err) { next(err); }
});

// ─── PUT /api/fixtures/:id/matches/:matchId ───────────────────────────────────

router.put('/:id/matches/:matchId', async (req, res, next) => {
  try {
    const fixture = await getFixtureOrThrow(req.params.id);
    if (fixture.is_finished) return res.status(409).json({ error: 'Fixture is finished and locked' });

    const { result, scoreA, scoreB } = req.body;
    const validResults = ['a_win', 'b_win', 'draw', 'not_played', null];
    if (!validResults.includes(result)) return res.status(400).json({ error: 'Invalid result value' });

    const status = result === null ? 'pending'
      : result === 'not_played' ? 'not_played'
      : 'completed';

    const match = await dbGet(
      'SELECT * FROM match_results WHERE id = ? AND fixture_id = ?',
      [req.params.matchId, req.params.id]
    );
    if (!match) return res.status(404).json({ error: 'Match not found' });

    await dbRun(
      `UPDATE match_results
       SET result = ?, score_a = ?, score_b = ?, status = ?, entered_at = ?
       WHERE id = ?`,
      [result, scoreA ?? null, scoreB ?? null, status, new Date().toISOString(), req.params.matchId]
    );

    const matches = await getMatches(req.params.id);
    res.json({
      matchId: req.params.matchId,
      result, scoreA, scoreB, status,
      progress: computeProgress(matches, fixture.is_finished),
    });
  } catch (err) { next(err); }
});

// ─── GET /api/fixtures/:id/stats ─────────────────────────────────────────────

router.get('/:id/stats', async (req, res, next) => {
  try {
    const fixture = await getFixtureOrThrow(req.params.id);
    const matches = await getMatches(fixture.id);
    const pts = { win: fixture.points_win, draw: fixture.points_draw, loss: fixture.points_loss };
    const rounds = buildRounds(matches);

    res.json({
      pairStats: computePairStats(matches, pts),
      playerStats: computePlayerStats(matches, { win: 10, draw: 5, loss: 0 }),
      progress: computeProgress(matches, fixture.is_finished),
      progression: computePointsProgression(matches, pts, rounds.length),
      teamStats: computeTeamStats(matches),
    });
  } catch (err) { next(err); }
});

// ─── GET /api/fixtures/:id/search?q=playerName ───────────────────────────────

router.get('/:id/search', async (req, res, next) => {
  try {
    await getFixtureOrThrow(req.params.id);
    const matches = await getMatches(req.params.id);
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ matches: [], pending: [], completed: [], notPlayed: [], partnerships: [] });
    res.json(searchPlayer(q, matches));
  } catch (err) { next(err); }
});

// ─── POST /api/fixtures/:id/finish ───────────────────────────────────────────

router.post('/:id/finish', async (req, res, next) => {
  try {
    const fixture = await getFixtureOrThrow(req.params.id);
    if (fixture.is_finished) return res.status(409).json({ error: 'Fixture already finished' });

    await dbRun(
      'UPDATE team_fixtures SET is_finished = 1, finished_at = ? WHERE id = ?',
      [new Date().toISOString(), req.params.id]
    );

    const matches = await getMatches(req.params.id);
    const updated = await dbGet('SELECT * FROM team_fixtures WHERE id = ?', [req.params.id]);
    res.json(serializeFixture(updated, matches));
  } catch (err) { next(err); }
});

// ─── PUT /api/fixtures/:id/points-scheme ─────────────────────────────────────

router.put('/:id/points-scheme', async (req, res, next) => {
  try {
    const fixture = await getFixtureOrThrow(req.params.id);
    const matches = await getMatches(fixture.id);
    const hasResults = matches.some(m => m.status !== 'pending');
    if (hasResults) return res.status(409).json({ error: 'Cannot change points scheme after results have been entered' });

    const { win = 2, draw = 1, loss = 0 } = req.body;
    await dbRun(
      'UPDATE team_fixtures SET points_win = ?, points_draw = ?, points_loss = ? WHERE id = ?',
      [win, draw, loss, req.params.id]
    );

    res.json({ win, draw, loss });
  } catch (err) { next(err); }
});

module.exports = router;


// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFixtureOrThrow(db, id) {
  const fixture = db.prepare('SELECT * FROM team_fixtures WHERE id = ?').get(id);
  if (!fixture) {
    const err = new Error('Fixture not found');
    err.status = 404;
    throw err;
  }
  return fixture;
}

function getMatches(db, fixtureId) {
  return db.prepare(
    'SELECT * FROM match_results WHERE fixture_id = ? ORDER BY round_number, court'
  ).all(fixtureId);
}

function buildRounds(matches) {
  const roundMap = new Map();
  for (const m of matches) {
    if (!roundMap.has(m.round_number)) roundMap.set(m.round_number, []);
    roundMap.get(m.round_number).push({
      id: m.id,
      court: m.court,
      teamAPair: [m.team_a_player1, m.team_a_player2],
      teamBPair: [m.team_b_player1, m.team_b_player2],
      result: m.result,
      scoreA: m.score_a,
      scoreB: m.score_b,
      status: m.status,
    });
  }
  return Array.from(roundMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([roundNumber, matches]) => ({ roundNumber, matches }));
}

function serializeFixture(fixture, matches) {
  const rounds = buildRounds(matches);
  const progress = computeProgress(matches, fixture.is_finished);
  return {
    id: fixture.id,
    teamAName: fixture.team_a_name,
    teamBName: fixture.team_b_name,
    teamAPlayers: JSON.parse(fixture.team_a_players),
    teamBPlayers: JSON.parse(fixture.team_b_players),
    scheduleMode: fixture.schedule_mode,
    courtsAvailable: fixture.courts_available,
    matchDurationMins: fixture.match_duration_mins,
    pointsScheme: { win: fixture.points_win, draw: fixture.points_draw, loss: fixture.points_loss },
    isFinished: !!fixture.is_finished,
    finishedAt: fixture.finished_at,
    shareToken: fixture.share_token,
    createdAt: fixture.created_at,
    rounds,
    summary: getFixtureSummary(JSON.parse(fixture.team_a_players), JSON.parse(fixture.team_b_players), rounds),
    progress,
  };
}

// ─── POST /api/fixtures ───────────────────────────────────────────────────────

router.post('/', (req, res, next) => {
  try {
    const {
      teamAName, teamBName, teamAPlayers, teamBPlayers,
      scheduleMode = 'fair_rounds',
      courtsAvailable = 4,
      matchDurationMins = 30,
      pointsScheme = { win: 2, draw: 1, loss: 0 },
    } = req.body;

    if (!teamAName || !teamBName) return res.status(400).json({ error: 'teamAName and teamBName are required' });
    if (!Array.isArray(teamAPlayers) || teamAPlayers.length < 4) return res.status(400).json({ error: 'teamAPlayers must have at least 4 players' });
    if (!Array.isArray(teamBPlayers) || teamBPlayers.length < 4) return res.status(400).json({ error: 'teamBPlayers must have at least 4 players' });
    if (teamAPlayers.length > 20 || teamBPlayers.length > 20) return res.status(400).json({ error: 'Maximum 20 players per team' });

    // Deduplicate player names within each team
    const cleanA = [...new Set(teamAPlayers.map(p => p.trim()).filter(Boolean))];
    const cleanB = [...new Set(teamBPlayers.map(p => p.trim()).filter(Boolean))];

    const generatedRounds = scheduleMode === 'full_fixture'
      ? generateFullFixture(cleanA, cleanB, courtsAvailable)
      : generateFairRoundsFixture(cleanA, cleanB, courtsAvailable);

    if (!generatedRounds.length) return res.status(400).json({ error: 'Could not generate fixture. Check player counts.' });

    const db = getDb();
    const fixtureId = uuidv4();
    const shareToken = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO team_fixtures
        (id, team_a_name, team_b_name, team_a_players, team_b_players,
         schedule_mode, courts_available, match_duration_mins,
         points_win, points_draw, points_loss, share_token, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      fixtureId, teamAName, teamBName,
      JSON.stringify(cleanA), JSON.stringify(cleanB),
      scheduleMode, courtsAvailable, matchDurationMins,
      pointsScheme.win ?? 2, pointsScheme.draw ?? 1, pointsScheme.loss ?? 0,
      shareToken, now
    );

    // Insert all match rows
    const insertMatch = db.prepare(`
      INSERT INTO match_results
        (id, fixture_id, round_number, court,
         team_a_player1, team_a_player2, team_b_player1, team_b_player2)
      VALUES (?,?,?,?,?,?,?,?)
    `);

    db.exec('BEGIN');
    try {
      for (const round of generatedRounds) {
        for (const m of round.matches) {
          insertMatch.run(
            uuidv4(), fixtureId, round.roundNumber, m.court,
            m.teamAPair[0], m.teamAPair[1], m.teamBPair[0], m.teamBPair[1]
          );
        }
      }
      db.exec('COMMIT');
    } catch (txErr) {
      db.exec('ROLLBACK');
      throw txErr;
    }

    const matches = getMatches(db, fixtureId);
    const fixture = db.prepare('SELECT * FROM team_fixtures WHERE id = ?').get(fixtureId);
    res.status(201).json(serializeFixture(fixture, matches));
  } catch (err) { next(err); }
});

// ─── GET /api/fixtures/:id ────────────────────────────────────────────────────

router.get('/:id', (req, res, next) => {
  try {
    const db = getDb();
    const fixture = getFixtureOrThrow(db, req.params.id);
    const matches = getMatches(db, fixture.id);
    res.json(serializeFixture(fixture, matches));
  } catch (err) { next(err); }
});

// ─── GET /api/fixtures/share/:token ──────────────────────────────────────────

router.get('/share/:token', (req, res, next) => {
  try {
    const db = getDb();
    const fixture = db.prepare('SELECT * FROM team_fixtures WHERE share_token = ?').get(req.params.token);
    if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
    const matches = getMatches(db, fixture.id);
    res.json(serializeFixture(fixture, matches));
  } catch (err) { next(err); }
});

// ─── PUT /api/fixtures/:id/matches/:matchId ───────────────────────────────────

router.put('/:id/matches/:matchId', (req, res, next) => {
  try {
    const db = getDb();
    const fixture = getFixtureOrThrow(db, req.params.id);
    if (fixture.is_finished) return res.status(409).json({ error: 'Fixture is finished and locked' });

    const { result, scoreA, scoreB } = req.body;
    const validResults = ['a_win', 'b_win', 'draw', 'not_played', null];
    if (!validResults.includes(result)) return res.status(400).json({ error: 'Invalid result value' });

    const status = result === null ? 'pending'
      : result === 'not_played' ? 'not_played'
      : 'completed';

    const match = db.prepare('SELECT * FROM match_results WHERE id = ? AND fixture_id = ?')
      .get(req.params.matchId, req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    db.prepare(`
      UPDATE match_results
      SET result = ?, score_a = ?, score_b = ?, status = ?, entered_at = ?
      WHERE id = ?
    `).run(result, scoreA ?? null, scoreB ?? null, status, new Date().toISOString(), req.params.matchId);

    const matches = getMatches(db, req.params.id);
    res.json({
      matchId: req.params.matchId,
      result, scoreA, scoreB, status,
      progress: computeProgress(matches, fixture.is_finished),
    });
  } catch (err) { next(err); }
});

// ─── GET /api/fixtures/:id/stats ─────────────────────────────────────────────

router.get('/:id/stats', (req, res, next) => {
  try {
    const db = getDb();
    const fixture = getFixtureOrThrow(db, req.params.id);
    const matches = getMatches(db, fixture.id);
    const pts = { win: fixture.points_win, draw: fixture.points_draw, loss: fixture.points_loss };
    const rounds = buildRounds(matches);

    res.json({
      pairStats: computePairStats(matches, pts),
      playerStats: computePlayerStats(matches, { win: 10, draw: 5, loss: 0 }),
      progress: computeProgress(matches, fixture.is_finished),
      progression: computePointsProgression(matches, pts, rounds.length),
      teamStats: computeTeamStats(matches),
    });
  } catch (err) { next(err); }
});

// ─── GET /api/fixtures/:id/search?q=playerName ───────────────────────────────

router.get('/:id/search', (req, res, next) => {
  try {
    const db = getDb();
    getFixtureOrThrow(db, req.params.id);
    const matches = getMatches(db, req.params.id);
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ matches: [], pending: [], completed: [], notPlayed: [], partnerships: [] });
    res.json(searchPlayer(q, matches));
  } catch (err) { next(err); }
});

// ─── POST /api/fixtures/:id/finish ───────────────────────────────────────────

router.post('/:id/finish', (req, res, next) => {
  try {
    const db = getDb();
    const fixture = getFixtureOrThrow(db, req.params.id);
    if (fixture.is_finished) return res.status(409).json({ error: 'Fixture already finished' });

    db.prepare('UPDATE team_fixtures SET is_finished = 1, finished_at = ? WHERE id = ?')
      .run(new Date().toISOString(), req.params.id);

    const matches = getMatches(db, req.params.id);
    const updated = db.prepare('SELECT * FROM team_fixtures WHERE id = ?').get(req.params.id);
    res.json(serializeFixture(updated, matches));
  } catch (err) { next(err); }
});

// ─── PUT /api/fixtures/:id/points-scheme ─────────────────────────────────────

router.put('/:id/points-scheme', (req, res, next) => {
  try {
    const db = getDb();
    const fixture = getFixtureOrThrow(db, req.params.id);
    const matches = getMatches(db, fixture.id);
    const hasResults = matches.some(m => m.status !== 'pending');
    if (hasResults) return res.status(409).json({ error: 'Cannot change points scheme after results have been entered' });

    const { win = 2, draw = 1, loss = 0 } = req.body;
    db.prepare('UPDATE team_fixtures SET points_win = ?, points_draw = ?, points_loss = ? WHERE id = ?')
      .run(win, draw, loss, req.params.id);

    res.json({ win, draw, loss });
  } catch (err) { next(err); }
});

module.exports = router;
