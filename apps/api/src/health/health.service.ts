import { Injectable } from '@nestjs/common';
import {
  HealthBodyDto,
  HealthParamsDto,
  HealthQueryDto,
} from './dto/health.dto';

@Injectable()
export class HealthService {
  check(body: HealthBodyDto, params: HealthParamsDto, query: HealthQueryDto) {
    return { status: 'ok' + body.body + params.params + query.query };
  }
}
