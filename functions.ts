import axios from 'axios';
import { fplApi } from './constants';
import Player from './src/models/Player';
import PlayerScore from './src/models/PlayerScore';
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
  const events = data.events;
  const players = data.elements;

  await PlayerScore.deleteMany({});

  for (const event of events) {
    const playerScoreArray = [];
    const gameWeekData = await fetchGameWeekData(event.id);
    for (const element of gameWeekData.elements) {
      const player = players.find((p) => p.id === element.id);
      if (player) {
        playerScoreArray.push({
          playerId: player.id,
          score: element.stats.total_points,
          event: event.id,
          isGoodPerformance: element.stats.total_points >= goodPerformanceThreshold,
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

export async function runDataUpdatePipeline() {
  await updateInHousePlayerDatabase();
  await updateInHouseScoreDatabase();
  await calculateAverageGoodPerformance();
}

export async function getBestPlayersByPosition(position: number, count: number) {
  const players = await Player.find({ position })
    .sort({ averageGoodPerformance: -1, totalScore: -1 })
    .limit(count);
  return players;
}

export async function buildUltimateTeam() {
  const position = {
    GK: 1,
    DEF: 2,
    MID: 3,
    FWD: 4,
  };
  // const formation = {
  //   GK: 2,
  //   DEF: 5,
  //   MID: 5,
  //   FWD: 3,
  // };
    const formation = {
    GK: 10,
    DEF: 10,
    MID: 10,
    FWD: 10,
  };
  // const formation = {
  //   GK: 1,
  //   DEF: 3,
  //   MID: 5,
  //   FWD: 2,
  // };

  const ultimateTeam = {
    goalkeepers: await getBestPlayersByPosition(position.GK, formation.GK),
    defenders: await getBestPlayersByPosition(position.DEF, formation.DEF),
    midfielders: await getBestPlayersByPosition(position.MID, formation.MID),
    forwards: await getBestPlayersByPosition(position.FWD, formation.FWD),
  };

  return ultimateTeam;
}
