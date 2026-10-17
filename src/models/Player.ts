import mongoose from 'mongoose';

export interface IPlayer {
  firstName: string;
  lastName: string;
  playerId: string;
  averageGoodPerformance: number;
  averageGoodPerformancePastFive: number;
  averageMinutesPerGame: number;
  totalScore: number;
  position: number;
  team: string;
  currentPrice: number;
}

const PlayerSchema = new mongoose.Schema<IPlayer>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  playerId: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  averageGoodPerformance: {
    type: Number,
    default: 0,
  },
  averageGoodPerformancePastFive: {
    type: Number,
    default: 0,
  },
  averageMinutesPerGame: {
    type: Number,
    default: 0,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  team: {
    type: String,
    required: true,
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
});

// Supports player lookups and bulkWrite filters.
// Also prevents duplicate player records.
PlayerSchema.index({ playerId: 1 }, { unique: true });

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
export default Player;
