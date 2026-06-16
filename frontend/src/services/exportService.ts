// ─── CSV / Excel Export Service ───────────────────────────────────────────────
// Generates Excel-compatible CSV files entirely in the browser — no backend, no
// third-party libraries. CSVs open natively in Excel / Google Sheets.
//
// Covers BRD requirements:
//   • FR9.17  — Export schedule (one row per match)
//   • FR9.36  — Export stats tables (points table, pairs stats, player stats)
//   • FR9.47  — Export Pending Matches Report (tournament-day checklist)

import type { Fixture, StatsResponse } from '../types';

// ─── Low-level helpers ─────────────────────────────────────────────────────────

/** Escape a single CSV cell — wraps in quotes and doubles any internal quotes. */
function cell(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Turn a 2D array of rows into a CSV string. */
function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map(r => r.map(cell).join(',')).join('\r\n');
}

/** Trigger a browser download of the given text as a file. */
function download(filename: string, text: string) {
  // Prepend a UTF-8 BOM so Excel renders accented names correctly.
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Filesystem-safe slug for filenames. */
function slug(s: string): string {
  return (s || 'fixture').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'fixture';
}

/** Human-readable match result, using the real team names. */
function resultLabel(fixture: Fixture, result: string | null): string {
  switch (result) {
    case 'a_win': return `${fixture.teamAName} Win`;
    case 'b_win': return `${fixture.teamBName} Win`;
    case 'draw': return 'Draw';
    case 'not_played': return 'Not Played';
    default: return '';
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'completed': return 'Completed';
    case 'in_progress': return 'Live';
    case 'not_played': return 'Not Played';
    default: return 'Pending';
  }
}

// ─── FR9.17 — Full schedule export (one row per match) ─────────────────────────

export function exportScheduleCsv(fixture: Fixture) {
  const header = [
    'Round', 'Court',
    `${fixture.teamAName} Player 1`, `${fixture.teamAName} Player 2`,
    `${fixture.teamBName} Player 1`, `${fixture.teamBName} Player 2`,
    'Result', 'Score A', 'Score B', 'Status',
  ];
  const rows: (string | number | null)[][] = [header];
  for (const round of fixture.rounds) {
    for (const m of round.matches) {
      rows.push([
        round.roundNumber, m.court,
        m.teamAPair[0], m.teamAPair[1],
        m.teamBPair[0], m.teamBPair[1],
        resultLabel(fixture, m.result), m.scoreA, m.scoreB, statusLabel(m.status),
      ]);
    }
  }
  download(`${slug(fixture.tournamentName)}-schedule.csv`, toCsv(rows));
}

// ─── FR9.47 — Pending matches report (tournament-day checklist) ────────────────

export function exportPendingCsv(fixture: Fixture) {
  const header = ['Done?', 'Round', 'Court', `${fixture.teamAName} Pair`, `${fixture.teamBName} Pair`];
  const rows: (string | number | null)[][] = [header];
  for (const round of fixture.rounds) {
    for (const m of round.matches) {
      if (m.status !== 'pending' && m.status !== 'in_progress') continue;
      rows.push([
        '[ ]', round.roundNumber, m.court,
        `${m.teamAPair[0]} & ${m.teamAPair[1]}`,
        `${m.teamBPair[0]} & ${m.teamBPair[1]}`,
      ]);
    }
  }
  download(`${slug(fixture.tournamentName)}-pending-matches.csv`, toCsv(rows));
}

// ─── FR9.36 — Combined stats export (points table + pairs + players) ───────────

export function exportStatsCsv(fixture: Fixture, stats: StatsResponse) {
  const rows: (string | number | null)[][] = [];

  rows.push([`${fixture.tournamentName} — Statistics`]);
  rows.push([`${fixture.teamAName} vs ${fixture.teamBName}`]);
  rows.push([]);

  // ── Pairs / Points table ──
  rows.push(['POINTS TABLE — PAIRS']);
  rows.push(['Pair', 'Team', 'Played', 'Won', 'Drawn', 'Lost', 'Points', 'Win %']);
  for (const p of stats.pairStats) {
    rows.push([
      `${p.players[0]} & ${p.players[1]}`,
      p.team === 'A' ? fixture.teamAName : fixture.teamBName,
      p.played, p.won, p.drawn, p.lost, p.points, `${p.winPct}%`,
    ]);
  }
  rows.push([]);

  // ── Player stats ──
  rows.push(['PLAYER STATS']);
  rows.push(['Player', 'Team', 'Played', 'Won', 'Drawn', 'Lost', 'Points', 'Win %']);
  for (const p of stats.playerStats) {
    rows.push([
      p.playerName,
      p.team === 'A' ? fixture.teamAName : fixture.teamBName,
      p.played, p.won, p.drawn, p.lost, p.points, `${p.winPct}%`,
    ]);
  }
  rows.push([]);

  // ── Team totals ──
  const { teamA, teamB } = stats.teamStats;
  rows.push(['TEAM TOTALS']);
  rows.push(['Team', 'Played', 'Won', 'Drawn', 'Lost', 'Points']);
  rows.push([fixture.teamAName, teamA.played, teamA.wins, teamA.draws, teamA.losses, teamA.points]);
  rows.push([fixture.teamBName, teamB.played, teamB.wins, teamB.draws, teamB.losses, teamB.points]);

  download(`${slug(fixture.tournamentName)}-stats.csv`, toCsv(rows));
}
