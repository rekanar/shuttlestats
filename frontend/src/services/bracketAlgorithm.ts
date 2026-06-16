// ─── Knockout Bracket Generation ──────────────────────────────────────────────
// Builds an empty single-elimination bracket. The admin fills in player names
// manually at every round (no auto-advance), per the agreed design.

import { v4 as uuid } from 'uuid';
import type { BracketRound } from '../types/championship';

const ROUND_NAME_BY_SIZE: Record<number, string> = {
  2: 'Final',
  4: 'Semi-Finals',
  8: 'Quarter-Finals',
  16: 'Round of 16',
  32: 'Round of 32',
  64: 'Round of 64',
};

export function roundNameForSize(size: number): string {
  return ROUND_NAME_BY_SIZE[size] ?? `Round of ${size}`;
}

export function generateBracketRounds(drawSize: number, sideSize: 1 | 2): BracketRound[] {
  const rounds: BracketRound[] = [];
  let n = drawSize;
  while (n >= 2) {
    const numMatches = n / 2;
    rounds.push({
      name: roundNameForSize(n),
      matches: Array.from({ length: numMatches }, () => ({
        id: uuid(),
        side1: Array(sideSize).fill(''),
        side2: Array(sideSize).fill(''),
        winner: null,
        score: null,
      })),
    });
    n = Math.floor(n / 2);
  }
  return rounds;
}

/** A knockout draw of N entrants always has N − 1 matches. */
export function totalBracketMatches(drawSize: number): number {
  return drawSize - 1;
}
