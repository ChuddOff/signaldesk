import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async getAccessToken(payload: { sub: string }) {
    return await this.jwtService.signAsync(payload);
  }

  async getRefreshToken(payload: { sub: string }) {
    return await this.jwtService.signAsync(payload);
  }

  async getTokens(payload: { sub: string }) {
    return {
      accessToken: await this.getAccessToken(payload),
      refreshToken: await this.getRefreshToken(payload),
    };
  }
}
