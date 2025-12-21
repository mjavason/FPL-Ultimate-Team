import mongoose from 'mongoose';

interface IPlayerScore {
  playerId: string;
  score: number;
  event: number;
  isGoodPerformance: boolean;

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
  event: {
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
});

export const PlayerScore = mongoose.model<IPlayerScore>('PlayerScore', PlayerScoreSchema);
export default PlayerScore;
