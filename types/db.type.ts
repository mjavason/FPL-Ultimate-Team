// TypeScript interfaces that match the FPL db.json structure exactly

interface Overrides {
  rules: Record<string, any>;
  scoring: Record<string, any>;
  element_types: any[];
  pick_multiplier: number | null;
}

interface Chip {
  id: number;
  name: string;
  number: number;
  start_event: number;
  stop_event: number;
  chip_type: string;
  overrides: Overrides;
}

interface ChipPlay {
  chip_name: string;
  num_played: number;
}

interface TopElementInfo {
  id: number;
  points: number;
}

interface Event {
  id: number;
  name: string;
  deadline_time: string;
  release_time: string | null;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number | null;
  deadline_time_epoch: number;
  deadline_time_game_offset: number;
  highest_score: number | null;
  is_previous: boolean;
  is_current: boolean;
  is_next: boolean;
  cup_leagues_created: boolean;
  h2h_ko_matches_created: boolean;
  can_enter: boolean;
  can_manage: boolean;
  released: boolean;
  ranked_count: number;
  overrides: Overrides;
  chip_plays: ChipPlay[];
  most_selected: number | null;
  most_transferred_in: number | null;
  top_element: number | null;
  top_element_info: TopElementInfo | null;
  transfers_made: number;
  most_captained: number | null;
  most_vice_captained: number | null;
}

interface GameSettings {
  league_join_private_max: number;
  league_join_public_max: number;
  league_max_size_public_classic: number;
  league_max_size_public_h2h: number;
  league_max_size_private_h2h: number;
  league_max_ko_rounds_private_h2h: number;
  league_prefix_public: string;
  league_points_h2h_win: number;
  league_points_h2h_lose: number;
  league_points_h2h_draw: number;
  league_ko_first_instead_of_random: boolean;
  cup_start_event_id: number | null;
  cup_stop_event_id: number | null;
  cup_qualifying_method: string | null;
  cup_type: string | null;
  featured_entries: any[];
  element_sell_at_purchase_price: boolean;
  percentile_ranks: number[];
  underdog_differential: number;
  squad_squadplay: number;
  squad_squadsize: number;
  squad_special_min: number | null;
  squad_special_max: number | null;
  squad_team_limit: number;
  squad_total_spend: number;
  ui_currency_multiplier: number;
  ui_use_special_shirts: boolean;
  ui_special_shirt_exclusions: any[];
  stats_form_days: number;
  sys_vice_captain_enabled: boolean;
  transfers_cap: number;
  transfers_sell_on_fee: number;
  max_extra_free_transfers: number;
  league_h2h_tiebreak_stats: string[];
  timezone: string;
}

interface GameConfigSettings {
  entry_per_event: boolean;
  timezone: string;
}

interface ScoringByPosition {
  DEF: number;
  FWD: number;
  GKP: number;
  MID: number;
}

interface GameConfigScoring {
  long_play: number;
  short_play: number;
  goals_conceded: ScoringByPosition;
  saves: number;
  goals_scored: ScoringByPosition;
  assists: number;
  clean_sheets: ScoringByPosition;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  own_goals: number;
  bonus: number;
  bps: number;
  influence: number;
  creativity: number;
  threat: number;
  ict_index: number;
  special_multiplier: number;
  tackles: number;
  clearances_blocks_interceptions: number;
  recoveries: number;
  defensive_contribution: ScoringByPosition;
  mng_goals_scored: ScoringByPosition;
  mng_clean_sheets: ScoringByPosition;
  mng_win: ScoringByPosition;
  mng_draw: ScoringByPosition;
  mng_loss: number;
  mng_underdog_win: ScoringByPosition;
  mng_underdog_draw: ScoringByPosition;
  starts: number;
  expected_assists: number;
  expected_goal_involvements: number;
  expected_goals_conceded: number;
  expected_goals: number;
}

interface GameConfig {
  settings: GameConfigSettings;
  rules: GameSettings;
  scoring: GameConfigScoring;
}

interface Phase {
  id: number;
  name: string;
  start_event: number;
  stop_event: number;
  highest_score: number | null;
}

interface Team {
  code: number;
  draw: number;
  form: string | null;
  id: number;
  loss: number;
  name: string;
  played: number;
  points: number;
  position: number;
  short_name: string;
  strength: number;
  team_division: string | null;
  unavailable: boolean;
  win: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
  pulse_id: number;
}

interface ElementStat {
  label: string;
  name: string;
}

interface ElementType {
  id: number;
  plural_name: string;
  plural_name_short: string;
  singular_name: string;
  singular_name_short: string;
  squad_select: number;
  squad_min_select: number | null;
  squad_max_select: number | null;
  squad_min_play: number;
  squad_max_play: number;
  ui_shirt_specific: boolean;
  sub_positions_locked: number[];
  element_count: number;
}

interface Element {
  can_transact: boolean;
  can_select: boolean;
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  code: number;
  cost_change_event: number;
  cost_change_event_fall: number;
  cost_change_start: number;
  cost_change_start_fall: number;
  dreamteam_count: number;
  element_type: number;
  ep_next: string;
  ep_this: string;
  event_points: number;
  first_name: string;
  form: string;
  id: number;
  in_dreamteam: boolean;
  news: string;
  news_added: string | null;
  now_cost: number;
  photo: string;
  points_per_game: string;
  removed: boolean;
  second_name: string;
  selected_by_percent: string;
  special: boolean;
  squad_number: number | null;
  status: string;
  team: number;
  team_code: number;
  total_points: number;
  transfers_in: number;
  transfers_in_event: number;
  transfers_out: number;
  transfers_out_event: number;
  value_form: string;
  value_season: string;
  web_name: string;
  region: number;
  team_join_date: string;
  birth_date: string;
  has_temporary_code: boolean;
  opta_code: string;
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
  influence_rank: number;
  influence_rank_type: number;
  creativity_rank: number;
  creativity_rank_type: number;
  threat_rank: number;
  threat_rank_type: number;
  ict_index_rank: number;
  ict_index_rank_type: number;
  corners_and_indirect_freekicks_order: number | null;
  corners_and_indirect_freekicks_text: string;
  direct_freekicks_order: number | null;
  direct_freekicks_text: string;
  penalties_order: number | null;
  penalties_text: string;
  expected_goals_per_90: number;
  saves_per_90: number;
  expected_assists_per_90: number;
  expected_goal_involvements_per_90: number;
  expected_goals_conceded_per_90: number;
  goals_conceded_per_90: number;
  now_cost_rank: number;
  now_cost_rank_type: number;
  form_rank: number;
  form_rank_type: number;
  points_per_game_rank: number;
  points_per_game_rank_type: number;
  selected_rank: number;
  selected_rank_type: number;
  starts_per_90: number;
  clean_sheets_per_90: number;
  defensive_contribution_per_90: number;
}

// Main database interface
export interface FPLDatabase {
  chips: Chip[];
  events: Event[];
  game_settings: GameSettings;
  game_config: GameConfig;
  phases: Phase[];
  teams: Team[];
  total_players: number;
  element_stats: ElementStat[];
  element_types: ElementType[];
  elements: Element[];
}

// Export individual interfaces for use in other parts of the application
export type {
  Chip,
  ChipPlay,
  Element,
  ElementStat,
  ElementType,
  Event,
  GameConfig,
  GameConfigScoring,
  GameConfigSettings,
  GameSettings,
  Overrides,
  Phase,
  ScoringByPosition,
  Team,
  TopElementInfo,
};
