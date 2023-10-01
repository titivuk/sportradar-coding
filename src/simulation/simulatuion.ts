import { Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

type Team = {
  id: string;
  name: string;
  score: number;
};

type Match = {
  id: string;
  name: string;
  teams: Team[];
};

enum SimulationState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export type SimulationData = {
  id: string;
  name: string;
  matches: Match[];
};

export type ScoreData = {
  simulationId: string;
  matchId: string;
  teamId: string;
  score: number;
};

export enum SimulationEvent {
  STARTED = 'started',
  SCORE = 'score',
  FINISHED = 'finished',
}

export class Simulation extends EventEmitter {
  readonly id = randomUUID();

  private readonly logger = new Logger(this.constructor.name);

  private intervalId: NodeJS.Timeout;
  private state: SimulationState = SimulationState.NOT_STARTED;

  private readonly matches: Match[] = [
    {
      id: '1',
      name: 'Germany vs Poland',
      teams: [
        { id: 'DE', name: 'Germany', score: 0 },
        { id: 'PL', name: 'Poland', score: 0 },
      ],
    },
    {
      id: '2',
      name: 'Brazil vs Mexico',
      teams: [
        { id: 'BR', name: 'Brazil', score: 0 },
        { id: 'MX', name: 'Mexico', score: 0 },
      ],
    },
    {
      id: '3',
      name: 'Argentina vs Uruguay',
      teams: [
        { id: 'AR', name: 'Argentina', score: 0 },
        { id: 'UY', name: 'Uruguay', score: 0 },
      ],
    },
  ];

  constructor(
    private readonly name: string,
    private readonly intervalMs = 10e3,
    private readonly scores = 9,
  ) {
    super();
  }

  toJSON(): SimulationData {
    return {
      id: this.id,
      name: this.name,
      matches: structuredClone(this.matches),
    };
  }

  start() {
    if (this.state !== SimulationState.NOT_STARTED) {
      this.logger.warn(
        `could not start simulation "${this.id}". Current state is "${this.state}"`,
      );
      return;
    }

    this.state = SimulationState.IN_PROGRESS;

    let counter = 0;
    this.intervalId = setInterval(() => {
      this.logger.log(`generating score for simulation "${this.id}"`);

      this.emit(SimulationEvent.SCORE, { ...this.score() });

      counter += 1;
      if (counter >= this.scores) {
        this.finish();
      }
    }, this.intervalMs);

    this.emit(SimulationEvent.STARTED, this.toJSON());

    this.logger.log(`simulation "${this.id}" started`);
  }

  private score(): ScoreData {
    const matchId = Math.floor(Math.random() * this.matches.length);
    const match = this.matches[matchId];

    const teamId = Math.floor(Math.random() * match.teams.length);

    this.matches[matchId].teams[teamId].score += 1;

    return {
      simulationId: this.id,
      matchId: this.matches[matchId].id,
      teamId: this.matches[matchId].teams[teamId].id,
      score: this.matches[matchId].teams[teamId].score,
    };
  }

  finish() {
    if (this.state !== SimulationState.IN_PROGRESS) {
      return;
    }

    this.state = SimulationState.FINISHED;

    this.emit(SimulationEvent.FINISHED);
    this.removeAllListeners();

    clearInterval(this.intervalId);

    this.logger.log(`simulation "${this.id}" finished`);
  }
}
