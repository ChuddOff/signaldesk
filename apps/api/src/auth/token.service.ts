import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getAccessToken(payload: { sub: string }) {
    return await this.jwtService.signAsync(payload);
  }

  async getRefreshToken(payload: { sub: string }) {
    const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const expiresIn = this.configService.get<StringValue>(
      'JWT_REFRESH_EXPIRES_IN',
    );
    return await this.jwtService.signAsync(payload, {
      secret: secret,
      expiresIn: expiresIn,
    });
  }

  async getIdFromAccessToken(token: string) {
    return this.jwtService.decode(token);
  }

  async getTokens(payload: { sub: string }) {
    return {
      accessToken: await this.getAccessToken(payload),
      refreshToken: await this.getRefreshToken(payload),
    };
  }
}
