import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';

import { HttpToWsExceptionsFilter } from '../shared/http-to-ws.exception-filter';
import {
  FinishSimulationDto,
  GatewayEvents,
  StartSimulationDto,
} from './contracts';

@UseFilters(new HttpToWsExceptionsFilter())
@WebSocketGateway({
  path: '/simulations',
  cors: {
    origin: '*',
  },
})
export class SimulationGateway {
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @SubscribeMessage(GatewayEvents.Start)
  handleStart(@MessageBody() data: StartSimulationDto) {
    console.log(`${GatewayEvents.Start} incoming event`);
    return { event: 'started', data: { id: randomUUID(), name: data.name } };
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @SubscribeMessage(GatewayEvents.Finish)
  handleFinish(@MessageBody() data: FinishSimulationDto) {
    return { event: 'finished', data: { id: data.id } };
  }
}
