import dotenv from 'dotenv';
import { ApiService } from './api.util';

dotenv.config({
  path: './.env',
});

export const PORT = process.env.PORT || 5000;
export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
export const fplUrl = 'https://fantasy.premierleague.com/api';
export const fplApi = new ApiService(fplUrl);
