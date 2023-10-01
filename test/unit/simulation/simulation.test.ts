import {
  ScoreData,
  Simulation,
  SimulationEvent,
} from '../../../src/simulation/simulatuion';

describe('SimulationRateLimiter', () => {
  const startCallback = jest.fn();
  const scoreCallback = jest.fn();
  const finishCallback = jest.fn();

  let simulation: Simulation;
  let scores = 9;
  let intervalMs = 100;

  beforeEach(() => {
    simulation = new Simulation('test simulation', intervalMs, scores);
  });

  afterEach(() => {
    simulation.removeAllListeners();
    simulation.finish();

    startCallback.mockReset();
    scoreCallback.mockReset();
    finishCallback.mockReset();
  });

  it('should finish simulation', async () => {
    const initialSimulationData = simulation.toJSON();

    simulation.on(SimulationEvent.STARTED, startCallback);
    simulation.on(SimulationEvent.SCORE, scoreCallback);
    const simulationFinish = new Promise((resolve) => {
      simulation.on(SimulationEvent.FINISHED, () => {
        finishCallback();
        resolve(0);
      });
    });

    simulation.start();

    // wait until simulation is done
    await simulationFinish;

    expect(startCallback).toBeCalledTimes(1);
    expect(startCallback.mock.calls[0][0]).toStrictEqual(initialSimulationData);

    expect(scoreCallback).toBeCalledTimes(scores);
    scoreCallback.mock.calls.forEach((call) =>
      expect(call[0]).toStrictEqual<ScoreData>({
        simulationId: simulation.id,
        matchId: expect.any(String),
        teamId: expect.any(String),
        score: expect.any(Number),
      }),
    );

    expect(finishCallback).toBeCalledTimes(1);
  });

  it('should start simulation only once', async () => {
    const initialSimulationData = simulation.toJSON();

    simulation.on(SimulationEvent.STARTED, startCallback);
    simulation.on(SimulationEvent.SCORE, scoreCallback);
    const simulationFinish = new Promise((resolve) => {
      simulation.on(SimulationEvent.FINISHED, () => {
        finishCallback();
        resolve(0);
      });
    });

    // try to start the simulation several times
    simulation.start();
    simulation.start();
    simulation.start();

    // wait until simulation is done
    await simulationFinish;

    expect(startCallback).toBeCalledTimes(1);
    expect(startCallback.mock.calls[0][0]).toStrictEqual(initialSimulationData);

    expect(scoreCallback).toBeCalledTimes(scores);
    scoreCallback.mock.calls.forEach((call) =>
      expect(call[0]).toStrictEqual<ScoreData>({
        simulationId: simulation.id,
        matchId: expect.any(String),
        teamId: expect.any(String),
        score: expect.any(Number),
      }),
    );

    expect(finishCallback).toBeCalledTimes(1);
  });
});
