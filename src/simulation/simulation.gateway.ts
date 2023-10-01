import { Logger } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

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

      socket.on('disconnect', () =>
        this.logger.log(`socket ${socket.id} disconnected`),
      );

      socket.emit('hello', "it's me...");
    } catch (err) {
      this.logger.error(
        `connection error "${socket.id}", clientId "${socket.handshake.query.clientId}", name "${socket.handshake.query.name}"`,
        err,
      );

      socket.disconnect(true);
    }
  }
}
