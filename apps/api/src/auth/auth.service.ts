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
import { randomUUID } from 'node:crypto';

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

    const password = await this.hashService.hash(registerDto.password);

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

    const isRightPassword = await this.hashService.verify(
      loginDto.password,
      user.passwordHash,
    );

    if (!isRightPassword) {
      throw new UnauthorizedException('Неверные данные');
    }
    const sessionId = randomUUID();
    const { accessToken, refreshToken } = await this.tokenService.getTokens({
      userId: user.id,
      sessionId,
    });

    const hashToken = await this.hashService.hash(refreshToken);

    await this.createSession(user.id, hashToken, ip, userAgent);

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string, ip: string, userAgent: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    if (!payload || !payload.userId || !payload.sessionId) {
      throw new UnauthorizedException('Неверные данные');
    }

    const { userId, sessionId } = payload;

    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Неверные данные');
    }

    const isRightToken = await this.hashService.verify(
      refreshToken,
      session?.refreshTokenHash,
    );

    if (!isRightToken) {
      throw new UnauthorizedException('Неверные данные');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.tokenService.getTokens({ userId, sessionId: session.id });

    const hashToken = await this.hashService.hash(newRefreshToken);

    await this.prismaService.session.update({
      where: { id: sessionId },
      data: {
        lastSeenAt: new Date(),
        refreshTokenHash: hashToken,
        userAgent,
        ip,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async createSession(
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
        lastSeenAt: new Date(),
      },
    });
  }
}
