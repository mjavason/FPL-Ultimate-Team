# FPL Ultimate Team Builder

A TypeScript Express API that fetches data from the Fantasy Premier League (FPL) API to build an ultimate team based on player performance statistics. The application analyzes player performances across all game weeks and creates an optimal team formation with the best performing players in each position.

## Features

- **Data Pipeline**: Automatically fetches and processes FPL player and performance data
- **Performance Analysis**: Calculates average good performance percentages for all players
- **Ultimate Team Builder**: Creates an optimal team with configurable formation (currently 2 GK, 5 DEF, 5 MID, 3 FWD)
- **REST API**: Provides endpoints to update data and retrieve the ultimate team
- **MongoDB Integration**: Stores player data and performance statistics locally
- **API Documentation**: Swagger/OpenAPI documentation available

## Prerequisites

- Node.js and npm (or yarn) installed on your system. You can download them from the [official Node.js website](https://nodejs.org)
- MongoDB database (local or cloud instance)

## Installation

1. Clone this repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd FPL-Ultimate-Team
   ```

3. Install the project's dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Set up environment variables:

   Copy the `env.sample` file to `.env` and configure your settings:

   ```bash
   cp env.sample .env
   ```

## Running the Project

The project includes several npm scripts:

- **Development Mode**

  ```bash
  npm run dev
  # or
  yarn dev
  ```

  Starts the development server with hot reloading using nodemon.

- **Build for Production**

  ```bash
  npm run build
  # or
  yarn build
  ```

  Compiles TypeScript to JavaScript in the `build` folder.

- **Production Mode**

  ```bash
  npm run start
  # or
  yarn start
  ```

  Runs the compiled application in production mode.

- **Run Tests**
  ```bash
  npm run test
  # or
  yarn test
  ```
  Executes the test suite using Jest.

## API Endpoints

### Core FPL Endpoints

- **GET `/update-database`**

  - Updates the local database with latest FPL data
  - Fetches player information and performance data from all game weeks
  - Calculates performance statistics

- **GET `/ultimate-team`**
  - Returns the ultimate team based on performance analysis
  - Formation: 2 Goalkeepers, 5 Defenders, 5 Midfielders, 3 Forwards
  - Players sorted by average good performance percentage and total score

### Utility Endpoints

- **GET `/`** - Health check endpoint
- **GET `/api`** - Demo external API call
- **GET `/docs`** - Swagger API documentation

## Team Formation

The current formation is configured as:

- **Goalkeepers**: 2 players
- **Defenders**: 5 players
- **Midfielders**: 5 players
- **Forwards**: 3 players

Players are ranked by:

1. Average good performance percentage (performances with 5+ points)
2. Total points scored across all game weeks

## Performance Criteria

A "good performance" is defined as scoring 5 or more points in a single game week. The application calculates what percentage of a player's total appearances resulted in good performances.

## API Documentation

After starting the server, access the interactive API documentation at:

- **Local**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **Production**: `{BASE_URL}/docs`

## Data Sources

- **FPL API**: `https://fantasy.premierleague.com/api/`
  - Player information and statistics
  - Game week performance data
  - Real-time FPL data

## Project Structure

```
├── src/
│   ├── models/           # Mongoose models (Player, PlayerScore)
│   └── database.ts       # Database connection
├── types/                # TypeScript type definitions
├── notes/                # Project documentation and data samples
├── functions.ts          # Core business logic
├── app.ts               # Express application setup
├── constants.ts         # Configuration constants
└── swagger.config.ts    # API documentation setup
```

## Environment Variables

Configure the following variables in your `.env` file:

```env
PORT=5000
BASE_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/fpl-ultimate-team
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
