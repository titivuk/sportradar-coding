## Description

Project created by Nestjs CLI

```bash
$ npx @nestjs/cli new sportradar-coding
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Solution Notes

The API is designed with the following considerations:

- for simplicity, simulation structure is very simple
  - no score history
  - time when score occured is not tracked
  - `setInterval` provides >= `intervalMs` delay (depends on how busy process is, etc). No rounding implemented to provide exactly `intervalMs` delays
- single connection supports multiple simulations
  - in order to run multiple simulations "real" `clientId` should be use for rate limiter
- no broadcasting supported to notify multiple clients
- rate-limiter uses `socket.id` to identify client for simplicity
  - `clientId` can be passed as query / taken from auth token
  - can be scaled by replacing `storageService` with Redis implementation, for example
- every simulation has it's own timer
  - it can be a problem if there are a lot simulations running
  - another approach is to have single independent timer and update simulations on every tick
- e2e test timeout set to 100 seconds
  - better approach is to override default simulation settings and speed up the tests
- simple client implemented for testing purposes (see `client` folder)

## Out of scope

- Cross-server event replication
- Hash-based balancing
- Auth
- Broadcast
- Data Persistance
- Unified API response structure
- Possibility to configure the simulation (useful for e2e)
