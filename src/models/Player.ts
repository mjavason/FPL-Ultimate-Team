import mongoose from 'mongoose';

export interface IPlayer {
  firstName: string;
  lastName: string;
  playerId: string;
  averageGoodPerformance: number;
  averageGoodPerformancePastFive: number;
  totalScore: number;
  position: number;
  team: string;
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
  totalScore: {
    type: Number,
    default: 0,
  },
  team: {
    type: String,
    required: true,
  },
});

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
export default Player;
