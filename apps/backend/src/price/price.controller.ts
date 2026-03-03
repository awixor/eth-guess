import { Controller, Get } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('current')
  getCurrentPrice(): { price: number } {
    return { price: this.priceService.getCurrentPrice() };
  }
}
