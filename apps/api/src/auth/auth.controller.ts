import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip =
      req.ip ||
      (Array.isArray(req.headers['x-forwarded-for'])
        ? (req.headers['x-forwarded-for'][0] as string)
        : (req.headers['x-forwarded-for'] as string));
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceId = Array.isArray(req.headers['x-device-id'])
      ? req.headers['x-device-id'][0]
      : req.headers['x-device-id'] || 'unknown';
    return this.authService.login(loginDto, ip, userAgent, deviceId);
  }

  @Post('refresh')
  refresh(@Body() refreshDto: RefreshDto, @Req() req: Request) {
    const ip =
      req.ip ||
      (Array.isArray(req.headers['x-forwarded-for'])
        ? (req.headers['x-forwarded-for'][0] as string)
        : (req.headers['x-forwarded-for'] as string));
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.refresh(refreshDto.refreshToken, ip, userAgent);
  }

  @Post('logout')
  logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.refreshToken);
  }

  @Post('logout-all')
  logoutAll(@Body() logoutDto: LogoutDto) {
    return this.authService.logoutAll(logoutDto.refreshToken);
  }
}
