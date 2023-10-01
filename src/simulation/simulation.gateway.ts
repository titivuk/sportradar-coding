import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { Throttle } from '@nestjs/throttler';
import { HttpToWsExceptionsFilter } from '../shared/http-to-ws.exception-filter';
import { throwException } from '../shared/throw-exception';
import { WsThrottlerGuard } from '../shared/ws-throttler.guard';
import {
  FinishSimulationDto,
  GatewayEvents,
  StartSimulationDto,
} from './contracts';
import { SimulationRegistry } from './simulation-registry';
import {
  ScoreData,
  Simulation,
  SimulationData,
  SimulationEvent,
} from './simulatuion';

@UseFilters(new HttpToWsExceptionsFilter())
@WebSocketGateway({
  path: '/simulations',
  cors: {
    origin: '*',
  },
})
export class SimulationGateway {
  constructor(private readonly simulationRegistry: SimulationRegistry) {}

  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @UseGuards(WsThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 5 * 6e3 } })
  @SubscribeMessage(GatewayEvents.Start)
  handleStart(
    @MessageBody() data: StartSimulationDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const simulation = new Simulation(data.name);

    simulation.on(SimulationEvent.STARTED, (data: SimulationData) =>
      socket.emit(SimulationEvent.STARTED, data),
    );
    simulation.on(SimulationEvent.SCORE, (data: ScoreData) =>
      socket.emit(SimulationEvent.SCORE, data),
    );
    simulation.on(SimulationEvent.FINISHED, () => {
      socket.emit(SimulationEvent.FINISHED, { id: simulation.id });
    });

    this.simulationRegistry.registerSimulation(simulation);

    simulation.start();

    socket.on('disconnect', () => simulation.finish());
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @SubscribeMessage(GatewayEvents.Finish)
  handleFinish(@MessageBody() data: FinishSimulationDto) {
    const simulation =
      this.simulationRegistry.getSimulation(data.id) ??
      throwException(new WsException(`Simulation ${data.id} not found`));

    simulation.finish();
  }
}
