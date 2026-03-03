import { Controller, Get, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MinBalanceGuard } from './guards/min-balance.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('current-round')
  async getCurrentRound() {
    return this.gameService.getCurrentRoundInfo();
  }

  @UseGuards(JwtAuthGuard, MinBalanceGuard)
  @Get('whale-room')
  getWhaleRoomAccess() {
    return {
      success: true,
      message: 'Welcome to the Whale Room! You have sufficient balance.',
    };
  }
}
