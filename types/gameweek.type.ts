interface GameweekPlayerStats {
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  clearances_blocks_interceptions: number;
  recoveries: number;
  tackles: number;
  defensive_contribution: number;
  starts: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  total_points: number;
  in_dreamteam: boolean;
}

// Individual stat explanation for a fixture
interface StatExplanation {
  identifier: string;
  points: number;
  value: number;
  points_modification: number;
}

// Fixture explanation containing all stats for that fixture
interface FixtureExplanation {
  fixture: number;
  stats: StatExplanation[];
}

// Complete gameweek element (player) data
interface GameweekElement {
  id: number;
  stats: GameweekPlayerStats;
  explain: FixtureExplanation[];
  modified: boolean;
}

// Main gameweek data structure
export interface GameWeekData {
  elements: GameweekElement[];
}

// Export individual types for reuse
export type { FixtureExplanation, GameweekElement, GameweekPlayerStats, StatExplanation };
