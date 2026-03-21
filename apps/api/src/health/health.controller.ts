import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { HealthService } from './health.service';
import {
  HealthBodyDto,
  HealthParamsDto,
  HealthQueryDto,
} from './dto/health.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Get()
  health(
    @Body() body: HealthBodyDto,
    @Query() query: HealthQueryDto,
    @Param() params: HealthParamsDto,
  ): { status: string } {
    return this.healthService.check(body, params, query);
  }
}
