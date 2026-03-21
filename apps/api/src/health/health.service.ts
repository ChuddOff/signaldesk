import { Injectable } from '@nestjs/common';
import {
  HealthBodyDto,
  HealthParamsDto,
  HealthQueryDto,
} from './dto/health.dto';

@Injectable()
export class HealthService {
  check(params: HealthParamsDto, query: HealthQueryDto, body?: HealthBodyDto) {
    return { status: 'ok' + body?.body + params.params + query.query };
  }
}
