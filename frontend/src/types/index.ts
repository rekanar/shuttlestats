// ─── Fixture Types ────────────────────────────────────────────────────────────

export type ScheduleMode = 'fair_rounds' | 'full_fixture';
export type MatchResult = 'a_win' | 'b_win' | 'draw' | 'not_played' | null;
export type MatchStatus = 'pending' | 'in_progress' | 'completed' | 'not_played';
export type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed';

export interface PointsScheme {
  win: number;
  draw: number;
  loss: number;
}

export interface FixtureMatch {
  id: string;
  court: number;
  teamAPair: [string, string];
  teamBPair: [string, string];
  result: MatchResult;
  scoreA: string | null;
  scoreB: string | null;
  status: MatchStatus;
}

export interface FixtureRound {
  roundNumber: number;
  matches: FixtureMatch[];
}

export interface ProgressStats {
  total: number;
  completed: number;
  notPlayed: number;
  pending: number;
  inProgress: number;
  pct: number;
  isFinished: boolean;
}

export interface FixtureSummary {
  totalRounds: number;
  totalMatches: number;
  matchesPerPlayer: string;
  playerMatchCount: Record<string, number>;
}

export interface Fixture {
  id: string;
  tournamentName: string;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  teamAPlayers: string[];
  teamBPlayers: string[];
  scheduleMode: ScheduleMode;
  courtsAvailable: number;
  matchDurationMins: number;
  pointsScheme: PointsScheme;
  isFinished: boolean;
  finishedAt: string | null;
  shareToken: string;
  createdAt: string;
  rounds: FixtureRound[];
  summary: FixtureSummary;
  progress: ProgressStats;
}

// ─── Stats Types ─────────────────────────────────────────────────────────────

export interface PairStats {
  pairKey: string;
  team: 'A' | 'B';
  players: [string, string];
  played: number;
  won: number;
  lost: number;
  drawn: number;
  points: number;
  winPct: number;
}

export interface PlayerStats {
  playerName: string;
  team: 'A' | 'B';
  played: number;
  won: number;
  lost: number;
  drawn: number;
  points: number;
  winPct: number;
}

export interface StatsResponse {
  pairStats: PairStats[];
  playerStats: PlayerStats[];
  progress: ProgressStats;
  progression: Record<string, number[]>;
  teamStats: TeamStats;
}

export interface TeamSideStats {
  wins: number;
  losses: number;
  draws: number;
  points: number;
  played: number;
}

export interface TeamStats {
  teamA: TeamSideStats;
  teamB: TeamSideStats;
}

// ─── Search Types ─────────────────────────────────────────────────────────────

export interface Partnership {
  partner: string;
  played: number;
  won: number;
  lost: number;
  winPct: number;
}

export interface SearchResult {
  matches: FixtureMatch[];
  pending: FixtureMatch[];
  completed: FixtureMatch[];
  notPlayed: FixtureMatch[];
  partnerships: Partnership[];
}

// ─── Form Types ──────────────────────────────────────────────────────────────

export interface CreateFixturePayload {
  tournamentName: string;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  teamAPlayers: string[];
  teamBPlayers: string[];
  scheduleMode: ScheduleMode;
  courtsAvailable: number;
  matchDurationMins: number;
  pointsScheme: PointsScheme;
}

// ─── Tournament History ────────────────────────────────────────────────────────

export interface TournamentSummary {
  id: string;
  tournamentName: string;
  teamAName: string;
  teamBName: string;
  createdAt: string;
  isFinished: boolean;
  totalMatches: number;
  completedMatches: number;
  pct: number;
}
