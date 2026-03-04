import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { PriceModule } from '../price/price.module';

@Module({
  imports: [PriceModule],
  providers: [GameService, GameGateway],
  controllers: [GameController],
})
export class GameModule {}
