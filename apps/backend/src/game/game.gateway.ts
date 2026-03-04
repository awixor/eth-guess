import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameEvent, RoundInfo } from './types/game.types';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  afterInit() {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emits an event to all connected clients when a new round starts.
   */
  emitRoundStarted(data: RoundInfo) {
    this.server.emit(GameEvent.ROUND_STARTED, data);
    this.logger.log(`Emitted roundStarted: ${data.roundId}`);
  }

  /**
   * Emits an event to all connected clients when a round is settled.
   */
  emitRoundSettled(data: RoundInfo) {
    this.server.emit(GameEvent.ROUND_SETTLED, data);
    this.logger.log(`Emitted roundSettled: ${data.roundId}`);
  }
}
