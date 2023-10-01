import {
  ScoreData,
  Simulation,
  SimulationEvent,
} from '../../../src/simulation/simulatuion';

describe('SimulationRateLimiter', () => {
  const onStarted = jest.fn();
  const onScore = jest.fn();
  const onFinished = jest.fn();

  let simulation: Simulation;
  let scores = 9;
  let intervalMs = 100;

  beforeEach(() => {
    simulation = new Simulation('test simulation', intervalMs, scores);
  });

  afterEach(() => {
    simulation.removeAllListeners();
    simulation.finish();

    onStarted.mockReset();
    onScore.mockReset();
    onFinished.mockReset();
  });

  test('should finish simulation', async () => {
    const initialSimulationData = simulation.toJSON();

    simulation.on(SimulationEvent.STARTED, onStarted);
    simulation.on(SimulationEvent.SCORE, onScore);
    const simulationFinish = new Promise((resolve) => {
      simulation.on(SimulationEvent.FINISHED, () => {
        onFinished();
        resolve(0);
      });
    });

    simulation.start();

    // wait until simulation is done
    await simulationFinish;

    expect(onStarted).toBeCalledTimes(1);
    expect(onStarted.mock.calls[0][0]).toStrictEqual(initialSimulationData);

    expect(onScore).toBeCalledTimes(scores);
    onScore.mock.calls.forEach((call) =>
      expect(call[0]).toStrictEqual<ScoreData>({
        simulationId: simulation.id,
        matchId: expect.any(String),
        teamId: expect.any(String),
        score: expect.any(Number),
      }),
    );

    expect(onFinished).toBeCalledTimes(1);
  });

  test('should start simulation only once', async () => {
    const initialSimulationData = simulation.toJSON();

    simulation.on(SimulationEvent.STARTED, onStarted);
    simulation.on(SimulationEvent.SCORE, onScore);
    const simulationFinish = new Promise((resolve) => {
      simulation.on(SimulationEvent.FINISHED, () => {
        onFinished();
        resolve(0);
      });
    });

    // try to start the simulation several times
    simulation.start();
    simulation.start();
    simulation.start();

    // wait until simulation is done
    await simulationFinish;

    expect(onStarted).toBeCalledTimes(1);
    expect(onStarted.mock.calls[0][0]).toStrictEqual(initialSimulationData);

    expect(onScore).toBeCalledTimes(scores);
    onScore.mock.calls.forEach((call) =>
      expect(call[0]).toStrictEqual<ScoreData>({
        simulationId: simulation.id,
        matchId: expect.any(String),
        teamId: expect.any(String),
        score: expect.any(Number),
      }),
    );

    expect(onFinished).toBeCalledTimes(1);
  });
});
