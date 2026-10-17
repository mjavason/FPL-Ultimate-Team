import mongoose from 'mongoose';

interface IPlayerScore {
  playerId: string;
  score: number;
  isGoodPerformance: boolean;
  minutes: number;
  gameWeek: number;
}

const PlayerScoreSchema = new mongoose.Schema<IPlayerScore>({
  playerId: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  gameWeek: {
    type: Number,
    required: true,
  },
  isGoodPerformance: {
    type: Boolean,
    required: true,
  },
  minutes: {
    type: Number,
    required: true,
  },
});

// Supports retrieving the latest gameweek efficiently.
PlayerScoreSchema.index({ gameWeek: -1 });

// Enforces one score record per player per gameweek.
// Also supports queries filtering by playerId and gameWeek.
PlayerScoreSchema.index({ playerId: 1, gameWeek: 1 }, { unique: true });

export const PlayerScore = mongoose.model<IPlayerScore>('PlayerScore', PlayerScoreSchema);
export default PlayerScore;
