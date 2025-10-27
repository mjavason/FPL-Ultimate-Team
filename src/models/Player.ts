import mongoose from 'mongoose';

interface IPlayer {
  firstName: string;
  lastName: string;
  playerId: string;
  averageGoodPerformance: number;
  totalScore: number;
  position: number;
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
  totalScore: {
    type: Number,
    default: 0,
  },
});

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
export default Player;
