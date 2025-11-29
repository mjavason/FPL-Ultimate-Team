import axios from 'axios';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import { BASE_URL, PORT } from './constants';
import { buildUltimateTeam, runDataUpdatePipeline } from './functions';
import { connectDB } from './src/database';
import { setupSwagger } from './swagger.config';

//#region App Setup
const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(cors());
app.use(morgan('dev'));
setupSwagger(app, BASE_URL);

//#endregion App Setup

//#region Code here

/**
 * @swagger
 * /sync:
 *   get:
 *     summary: Update the in-house database with FPL data
 *     description: Fetches data from the FPL API and updates the in-house database. Run this endpoint to refresh the data.
 *     tags: [FPL]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/sync', async (req: Request, res: Response) => {
  await runDataUpdatePipeline();
  return res.status(200).send({
    message: 'In-house database updated successfully',
  });
});

/**
 * @swagger
 * /ultimate-team:
 *   get:
 *     summary: Get the ultimate team sorted by overall performance
 *     description: Returns a list of players sorted by their overall performance. 5 defenders, 5 midfielders, 3 forwards, and 2 goalkeepers.
 *     tags: [FPL]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/ultimate-team', async (req: Request, res: Response) => {
  const ultimateTeam = await buildUltimateTeam();
  return res.status(200).send(ultimateTeam);
});

//#endregion

//#region Server Setup

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Call a demo external API (httpbin.org)
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/api', async (req: Request, res: Response) => {
  try {
    const result = await axios.get('https://httpbin.org');
    return res.send({
      message: 'Demo API called (httpbin.org)',
      data: result.status,
    });
  } catch (error: any) {
    console.error('Error calling external API:', error.message);
    return res.status(500).send({
      error: 'Failed to call external API',
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health check
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/', (req: Request, res: Response) => {
  return res.send({
    message: 'API is Live!',
  });
});

/**
 * @swagger
 * /obviously/this/route/cant/exist:
 *   get:
 *     summary: API 404 Response
 *     description: Returns a non-crashing result when you try to run a route that doesn't exist
 *     tags: [Default]
 *     responses:
 *       '404':
 *         description: Route not found
 */
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'API route does not exist',
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // throw Error('This is a sample error');
  console.log(`${'\x1b[31m'}`); // start color red
  console.log(`${err.message}`);
  console.log(`${'\x1b][0m]'}`); //stop color

  return res.status(500).send({
    success: false,
    status: 500,
    message: err.message,
  });
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});

// (for render services) Keep the API awake by pinging it periodically
// setInterval(pingSelf(BASE_URL), 600000);

//#endregion
