import axios from 'axios';
import { fplApi } from './constants';
import Player from './src/models/Player';
import PlayerScore from './src/models/PlayerScore';
import { transformPlayer } from './src/transform-player.transformer';
import { FPLDatabase } from './types/db.type';
import { GameWeekData } from './types/gameweek.type';
const fs = require('fs');
const path = require('path');

// Clear database and run data update pipeline if this value is changed
const goodPerformanceThreshold = 5;

export async function pingSelf(url: string) {
  try {
    const { data } = await axios.get(url);
    console.log(`Server pinged successfully: ${data.message}`);
    return true;
  } catch (e: any) {
    console.error(`Error pinging server: ${e.message}`);
    return false;
  }
}

export async function fetchFPLData() {
  try {
    const data = await fplApi.get<FPLDatabase>('/bootstrap-static/');
    return data;
  } catch (error) {
    console.error('Error fetching FPL data:', error);
    throw error;
  }
}

export function getGameWeekCount(db: FPLDatabase) {
  const currentEvent = db.events.find((event) => event.is_current);

  return {
    current: currentEvent?.id ?? null,
    total: db.events.length,
    finished: db.events.filter((event) => event.finished).length,
  };
}

export function findTeamNameById(teamId: number, teams: FPLDatabase['teams']): string {
  const team = teams.find((t) => t.id === teamId);
  return team ? team.name : 'Unknown Team';
}

export async function fetchGameWeekData(gameweek: number) {
  try {
    const data = await fplApi.get<GameWeekData>(`/event/${gameweek}/live/`);
    return data;
  } catch (error) {
    console.error(`Error fetching Game Week ${gameweek} data:`, error);
    throw error;
  }
}

export async function updateInHouseScoreDatabase() {
  const data = await fetchFPLData();
  const players = data.elements;
  const gameWeekCount = getGameWeekCount(data);

  await PlayerScore.deleteMany({});

  for (let i = 1; i <= gameWeekCount.finished; i++) {
    const playerScoreArray = [];
    const gameWeekData = await fetchGameWeekData(i);
    for (const player of players) {
      const element = gameWeekData.elements.find((e) => e.id === player.id);
      if (element) {
        playerScoreArray.push({
          playerId: player.id,
          score: element.stats.total_points,
          isGoodPerformance: element.stats.total_points >= goodPerformanceThreshold,
          gameWeek: i,
          minutes: element.stats.minutes,
        });
      } else {
        playerScoreArray.push({
          playerId: player.id,
          score: 0,
          isGoodPerformance: false,
          gameWeek: i,
          minutes: 0,
        });
      }
    }

    await PlayerScore.insertMany(playerScoreArray);
  }
}

export async function updateInHousePlayerDatabase() {
  const data = await fetchFPLData();
  const players = data.elements;

  await Player.deleteMany({});

  const playersArray = [];
  for (const player of players) {
    playersArray.push({
      playerId: player.id,
      firstName: player.first_name,
      lastName: player.second_name,
      position: player.element_type,
      team: findTeamNameById(player.team, data.teams),
    });
  }
  await Player.insertMany(playersArray);
}

// export async function calculateAverageGoodPerformance() {
//   const players = await Player.find();
//   for (const player of players) {
//     const performances = await PlayerScore.find({
//       playerId: player.playerId,
//     });
//     if (performances.length === 0) continue;

//     const goodPerformances = performances.filter((p) => p.isGoodPerformance);
//     const average = Math.round((goodPerformances.length / performances.length) * 100 * 100) / 100;
//     const totalScore = performances.reduce((sum, p) => sum + p.score, 0);

//     player.totalScore = totalScore;
//     player.averageGoodPerformance = average;
//     await player.save();
//   }
// }

// Unreadable - checkout the 3 functions below.
export async function calculatePlayerPerformanceStats(): Promise<void> {
  const latestScore = await PlayerScore.findOne()
    .sort({ gameWeek: -1 })
    .select({ gameWeek: 1, _id: 0 })
    .lean();

  const finishedGameWeek = latestScore?.gameWeek ?? 0;

  if (finishedGameWeek === 0) return;

  const startGameWeek = Math.max(1, finishedGameWeek - 4);
  const pastFiveDenominator = finishedGameWeek - startGameWeek + 1;

  const results = await PlayerScore.aggregate([
    {
      $group: {
        _id: '$playerId',
        totalScore: { $sum: { $ifNull: ['$score', 0] } },
        totalGames: { $sum: 1 },
        totalMinutes: { $sum: { $ifNull: ['$minutes', 0] } },
        goodCount: {
          $sum: {
            $cond: [{ $eq: ['$isGoodPerformance', true] }, 1, 0],
          },
        },
        recentFiveGoodCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$gameWeek', startGameWeek] },
                  { $lte: ['$gameWeek', finishedGameWeek] },
                  { $eq: ['$isGoodPerformance', true] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        playerId: '$_id',
        totalScore: 1,
        averageGoodPerformance: {
          $round: [
            {
              $multiply: [{ $divide: ['$goodCount', { $max: ['$totalGames', 1] }] }, 100],
            },
            2,
          ],
        },
        averageMinutesPerGame: {
          $round: [{ $divide: ['$totalMinutes', { $max: ['$totalGames', 1] }] }, 2],
        },
        averageGoodPerformancePastFive: {
          $round: [
            {
              $multiply: [
                {
                  $divide: ['$recentFiveGoodCount', Math.max(pastFiveDenominator, 1)],
                },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
  ]).exec();

  if (results.length === 0) return;

  await Player.bulkWrite(
    results.map((result) => ({
      updateOne: {
        filter: { playerId: result.playerId },
        update: {
          $set: {
            totalScore: result.totalScore,
            averageGoodPerformance: result.averageGoodPerformance,
            averageMinutesPerGame: result.averageMinutesPerGame,
            averageGoodPerformancePastFive: result.averageGoodPerformancePastFive,
          },
        },
      },
    })),
    { ordered: false },
  );
}

export async function calculateAverageGoodPerformance(): Promise<void> {
  const results = await PlayerScore.aggregate([
    {
      $group: {
        _id: '$playerId',
        totalScore: { $sum: '$score' },
        totalCount: { $sum: 1 },
        goodCount: {
          $sum: { $cond: [{ $eq: ['$isGoodPerformance', true] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        playerId: '$_id',
        _id: 0,
        totalScore: 1,
        averageGoodPerformance: {
          $round: [{ $multiply: [{ $divide: ['$goodCount', '$totalCount'] }, 100] }, 2],
        },
      },
    },
  ]);

  const bulkOps = results.map((r) => ({
    updateOne: {
      filter: { playerId: r.playerId },
      update: {
        $set: {
          totalScore: r.totalScore,
          averageGoodPerformance: r.averageGoodPerformance,
        },
      },
    },
  }));

  if (bulkOps.length > 0) {
    await Player.bulkWrite(bulkOps);
  }
}

export async function calculateAverageMinutesPerGame(): Promise<void> {
  const results = await PlayerScore.aggregate([
    {
      $group: {
        _id: '$playerId',
        totalMinutes: { $sum: '$minutes' },
        totalGames: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        playerId: '$_id',
        averageMinutesPerGame: {
          $round: [{ $divide: ['$totalMinutes', '$totalGames'] }, 2],
        },
      },
    },
  ]);

  const bulkOps = results.map((result) => ({
    updateOne: {
      filter: { playerId: result.playerId },
      update: {
        $set: {
          averageMinutesPerGame: result.averageMinutesPerGame,
        },
      },
    },
  }));

  if (bulkOps.length > 0) {
    await Player.bulkWrite(bulkOps);
  }
}

// TODO: Fix missed game bug
export async function calculateAverageGoodPerformancePastFive(): Promise<void> {
  const results = await PlayerScore.aggregate([
    {
      $sort: {
        gameWeek: -1,
      },
    },
    {
      $group: {
        _id: '$playerId',
        entries: {
          $push: {
            score: '$score',
            isGoodPerformance: '$isGoodPerformance',
          },
        },
      },
    },
    {
      $project: {
        playerId: '$_id',
        entries: { $slice: ['$entries', 5] },
      },
    },
    {
      $project: {
        playerId: 1,
        averageGoodPerformancePastFive: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: '$entries',
                          cond: { $eq: ['$$this.isGoodPerformance', true] },
                        },
                      },
                    },
                    { $size: '$entries' },
                  ],
                },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
  ]);

  const bulkOps = results.map((r) => ({
    updateOne: {
      filter: { playerId: r.playerId },
      update: {
        $set: {
          averageGoodPerformancePastFive: r.averageGoodPerformancePastFive,
        },
      },
    },
  }));

  if (bulkOps.length > 0) {
    await Player.bulkWrite(bulkOps);
  }
}

export async function runDataUpdatePipeline(): Promise<void> {
  await updateInHousePlayerDatabase();
  await updateInHouseScoreDatabase();
  await calculatePlayerPerformanceStats();
}

export async function getBestPlayersByPosition(position: number, count: number) {
  const players = await Player.find({ position })
    .sort({ averageGoodPerformance: -1, totalScore: -1 })
    .limit(count)
    .lean();
  return players;
}

export async function getBestPlayersByPositionPastFive(position: number, count: number) {
  const players = await Player.find({ position })
    .sort({ averageGoodPerformancePastFive: -1, totalScore: -1 })
    .limit(count)
    .lean();
  return players;
}

export async function buildUltimateTeam() {
  const position = {
    GK: 1,
    DEF: 2,
    MID: 3,
    FWD: 4,
  };
  const formation = {
    GK: 2,
    DEF: 5,
    MID: 5,
    FWD: 3,
  };

  // const formation = {
  //   GK: 1,
  //   DEF: 3,
  //   MID: 5,
  //   FWD: 2,
  // };

  const goalkeepers = await getBestPlayersByPosition(position.GK, formation.GK);
  const defenders = await getBestPlayersByPosition(position.DEF, formation.DEF);
  const midfielders = await getBestPlayersByPosition(position.MID, formation.MID);
  const forwards = await getBestPlayersByPosition(position.FWD, formation.FWD);

  return {
    goalKeepers: goalkeepers.map(transformPlayer),
    defenders: defenders.map(transformPlayer),
    midfielders: midfielders.map(transformPlayer),
    forwards: forwards.map(transformPlayer),
  };
}

export async function buildUltimateTeamPastFive() {
  const position = {
    GK: 1,
    DEF: 2,
    MID: 3,
    FWD: 4,
  };
  const formation = {
    GK: 2,
    DEF: 5,
    MID: 5,
    FWD: 3,
  };

  // const formation = {
  //   GK: 1,
  //   DEF: 3,
  //   MID: 5,
  //   FWD: 2,
  // };

  const goalkeepers = await getBestPlayersByPositionPastFive(position.GK, formation.GK);
  const defenders = await getBestPlayersByPositionPastFive(position.DEF, formation.DEF);
  const midfielders = await getBestPlayersByPositionPastFive(position.MID, formation.MID);
  const forwards = await getBestPlayersByPositionPastFive(position.FWD, formation.FWD);

  return {
    goalkeepers: goalkeepers.map(transformPlayer),
    defenders: defenders.map(transformPlayer),
    midfielders: midfielders.map(transformPlayer),
    forwards: forwards.map(transformPlayer),
  };
}

export async function teamBestFive(teamName: string) {
  const players = await Player.find({ team: RegExp(teamName, 'i') })
    .sort({ averageGoodPerformance: -1, totalScore: -1 })
    .limit(5)
    .lean();

  return players.map(transformPlayer);
}

export async function test() {
  const data = await fetchFPLData();
  const gameWeekData = getGameWeekCount(data);

  return {
    data: gameWeekData,
    message: 'Test Successful',
  };
}
