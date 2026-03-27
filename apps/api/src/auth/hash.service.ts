import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';

@Injectable()
export class HashService {
  async hash(password: string): Promise<string> {
    return argon.hash(password, { type: argon.argon2id });
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return argon.verify(hash, password);
  }
}
