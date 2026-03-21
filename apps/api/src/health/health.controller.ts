import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { HealthService } from './health.service';
import {
  HealthBodyDto,
  HealthParamsDto,
  HealthQueryDto,
} from './dto/health.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Get(':params')
  health(
    @Query() query: HealthQueryDto,
    @Param() params: HealthParamsDto,
  ): { status: string } {
    return this.healthService.check(params, query);
  }

  @Post(':params')
  postHealth(
    @Query() query: HealthQueryDto,
    @Param() params: HealthParamsDto,
    @Body() body: HealthBodyDto,
  ): { status: string } {
    return this.healthService.check(params, query, body);
  }
}
