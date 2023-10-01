import { Logger } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { simulationConnectionQuerySchema } from './contracts';

@WebSocketGateway({
  path: '/simulations',
  cors: {
    origin: '*',
  },
})
export class SimulationGateway implements OnGatewayConnection {
  private readonly logger = new Logger(this.constructor.name);

  async handleConnection(socket: Socket) {
    try {
      this.logger.log(
        `incoming connection "${socket.id}", clientId "${socket.handshake.query.clientId}", name "${socket.handshake.query.name}"`,
      );

      const result = simulationConnectionQuerySchema.safeParse(
        socket.handshake.query,
      );
      if (!result.success) {
        this.logger.error(
          `validation failed for "${socket.id}", clientId "${
            socket.handshake.query.clientId
          }", name "${socket.handshake.query.name}": ${JSON.stringify(
            result,
            null,
            2,
          )}`,
        );
        // there could be some kind of error event as well
        socket.disconnect(true);
        return;
      }

      socket.on('disconnect', () =>
        this.logger.log(`socket ${socket.id} disconnected`),
      );

      socket.emit('hello', "it's me...");
    } catch (err) {
      this.logger.error(
        `connection error "${socket.id}", clientId "${socket.handshake.query.clientId}", name "${socket.handshake.query.name}"`,
        err,
      );

      // there could be some kind of error event as well
      socket.disconnect(true);
    }
  }
}
