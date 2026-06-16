// ─── Championship (manual knockout) Types ─────────────────────────────────────
// A standalone feature, independent of the Team-vs-Team fixtures model.
// One generic single-elimination bracket covers all 5 event categories,
// parameterised only by side size (1 = singles, 2 = doubles).

export type EventCategory =
  | 'mens_singles'
  | 'womens_singles'
  | 'mens_doubles'
  | 'womens_doubles'
  | 'mixed_doubles';

export interface BracketMatch {
  id: string;
  side1: string[];        // player name(s) — length = sideSize
  side2: string[];
  winner: 1 | 2 | null;   // which side won
  score: string | null;   // optional, e.g. "21-18, 21-15"
}

export interface BracketRound {
  name: string;           // "Final", "Semi-Finals", "Quarter-Finals", "Round of 16"…
  matches: BracketMatch[];
}

export interface ChampionshipEvent {
  id: string;
  category: EventCategory;
  drawSize: number;       // 4 | 8 | 16 | 32
  sideSize: 1 | 2;
  rounds: BracketRound[];
}

export interface Championship {
  id: string;
  name: string;
  createdAt: string;
  events: ChampionshipEvent[];
}

export interface ChampionshipSummary {
  id: string;
  name: string;
  createdAt: string;
  eventCount: number;
}

export const EVENT_CATEGORIES: { key: EventCategory; label: string; sideSize: 1 | 2; icon: string }[] = [
  { key: 'mens_singles',   label: "Men's Singles",   sideSize: 1, icon: '👨' },
  { key: 'womens_singles', label: "Women's Singles", sideSize: 1, icon: '👩' },
  { key: 'mens_doubles',   label: "Men's Doubles",   sideSize: 2, icon: '👬' },
  { key: 'womens_doubles', label: "Women's Doubles", sideSize: 2, icon: '👭' },
  { key: 'mixed_doubles',  label: "Mixed Doubles",   sideSize: 2, icon: '🧑‍🤝‍🧑' },
];

export const DRAW_SIZES = [4, 8, 16, 32] as const;

export function categoryLabel(c: EventCategory): string {
  return EVENT_CATEGORIES.find(x => x.key === c)?.label ?? c;
}

export function categoryIcon(c: EventCategory): string {
  return EVENT_CATEGORIES.find(x => x.key === c)?.icon ?? '🏸';
}
