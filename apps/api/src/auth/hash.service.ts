import * as argon from 'argon2';

export class HashService {
  async hashPassword(password: string): Promise<string> {
    return argon.hash(password, { type: argon.argon2id });
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return argon.verify(hash, password);
  }
}
