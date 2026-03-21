import { Injectable } from '@nestjs/common';
import {
  HealthBodyDto,
  HealthParamsDto,
  HealthQueryDto,
} from './dto/health.dto';

@Injectable()
export class HealthService {
  check() {
    return { status: 'ok' };
  }
  checkPost(
    params: HealthParamsDto,
    query: HealthQueryDto,
    body: HealthBodyDto,
  ) {
    return { status: 'ok' + params.params + query.query + body.body };
  }
}
