import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { ConfigService } from '@nestjs/config';
import { PriceService } from '../price/price.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(''),
          },
        },
        {
          provide: PriceService,
          useValue: {
            getCurrentPrice: jest.fn().mockReturnValue(3000),
          },
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
