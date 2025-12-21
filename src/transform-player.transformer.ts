import { IPlayer } from './models/Player';

export function transformPlayer(player: IPlayer) {
    const performanceDeviation = Math.floor(
        player.averageGoodPerformancePastFive - player.averageGoodPerformance,
    );
  return {
    ...player,
    performanceDeviation
  };
}
