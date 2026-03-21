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
  @Get()
  health(): { status: string } {
    return this.healthService.check();
  }

  @Post(':params')
  postHealth(
    @Query() query: HealthQueryDto,
    @Param() params: HealthParamsDto,
    @Body() body: HealthBodyDto,
  ): { status: string } {
    return this.healthService.checkPost(params, query, body);
  }
}
