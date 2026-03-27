import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/database/prisma.service';
import { HashService } from './hash.service';
import { Prisma } from '../generated/prisma/client';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private hashService: HashService,
    private tokenService: TokenService,
  ) {}
  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();

    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (user?.email) {
      throw new ConflictException('Почта занята');
    }

    const password = await this.hashService.hashPassword(registerDto.password);

    try {
      const result = await this.prismaService.user.create({
        data: {
          email,
          passwordHash: password,
          displayName: registerDto.displayName.trim(),
        },
      });

      return {
        id: result?.id,
        email: result?.email,
        displayName: result?.displayName,
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException('Почта занята');
        }
      }
      throw err;
    }
  }

  async login(loginDto: LoginDto, ip: string, userAgent: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email.trim().toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Неверные данные');
    }

    const isRightPassword = await this.hashService.verifyPassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isRightPassword) {
      throw new UnauthorizedException('Неверные данные');
    }

    const { accessToken, refreshToken } = await this.tokenService.getTokens({
      sub: user.id,
    });

    const hashToken = await this.hashService.hashPassword(refreshToken);

    this.newSession(user.id, hashToken, ip, userAgent);

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      accessToken,
      refreshToken,
    };
  }

  async newSession(
    userId: string,
    refreshTokenHash: string,
    ip: string,
    userAgent: string,
  ) {
    await this.prismaService.session.create({
      data: {
        userId,
        ip,
        userAgent,
        refreshTokenHash,
      },
    });
  }
}
