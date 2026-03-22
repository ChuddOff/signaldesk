import { Injectable, NotFoundException } from '@nestjs/common';
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
    if (query.query === 'error') {
      throw new Error('error');
    } else if (query.query === '404') {
      throw new NotFoundException('404___404');
    }

    return { status: 'ok' + params.params + query.query + body.body };
  }
}
