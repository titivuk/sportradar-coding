import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client';
import { AppModule } from './../src/app.module';
import { ScoreData } from 'src/simulation/simulatuion';

describe('SimulationGateway (e2e)', () => {
  let app: INestApplication;
  let client: ClientSocket;
  let port = 3000;

  const onConnect = jest
      .fn()
      .mockImplementation(() => console.log('onConnect')),
    onException = jest
      .fn()
      .mockImplementation(() => console.log('onException')),
    onDisconnect = jest
      .fn()
      .mockImplementation(() => console.log('onDisconnect')),
    onStarted = jest.fn().mockImplementation(() => console.log('onStarted')),
    onScore = jest.fn().mockImplementation(() => console.log('onScore')),
    onFinished = jest.fn().mockImplementation(() => console.log('onFinished'));

  function waitFor(socket: ClientSocket, event: string) {
    return new Promise((resolve) => {
      socket.once(event, resolve);
    });
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    app.listen(port);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    client.removeAllListeners();
    client.disconnect();

    onConnect.mockClear();
    onException.mockClear();
    onDisconnect.mockClear();
    onStarted.mockClear();
    onScore.mockClear();
    onFinished.mockClear();
  });

  test('should sucessfully finish simulation ', async () => {
    client = ioc(`http://localhost:${port}`, {
      path: `/simulations`,
    });

    let simulationName = 'Katar 2023';

    client
      .on('connect', onConnect)
      .on('exception', onException)
      .on('disconnect', onDisconnect)
      .on('started', onStarted)
      .on('score', onScore)
      .on('finished', onFinished);

    client.emit('start', { name: simulationName });

    await waitFor(client, 'finished');

    expect(onConnect).toBeCalledTimes(1);
    expect(onException).toBeCalledTimes(0);
    expect(onDisconnect).toBeCalledTimes(0);
    expect(onStarted).toBeCalledTimes(1);

    expect(onScore).toBeCalledTimes(9);
    onScore.mock.calls.forEach((call) =>
      expect(call[0]).toStrictEqual<ScoreData>({
        simulationId: expect.any(String),
        matchId: expect.any(String),
        teamId: expect.any(String),
        score: expect.any(Number),
      }),
    );

    expect(onFinished).toBeCalledTimes(1);
    expect(onFinished.mock.calls[0][0]).toStrictEqual({
      id: expect.any(String),
    });
  });
});
