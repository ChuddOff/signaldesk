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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private hashService: HashService,
    private tokenService: TokenService,
    private configService: ConfigService,
  ) {}
  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();

    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (user?.email) {
      throw new ConflictException('Почта занята');
    }

    const password = await this.hashService.hash(registerDto.password);

    try {
      const token = this.tokenService.generateToken();
      const hash = this.hashService.sha256(token);

      return await this.prismaService.$transaction(async (prisma) => {
        const result = await prisma.user.create({
          data: {
            email,
            passwordHash: password,
            displayName: registerDto.displayName.trim(),
          },
        });

        await prisma.oneTimeToken.create({
          data: {
            expiresAt: new Date(Date.now() + 1000 * 15 * 60),
            tokenHash: hash,
            userId: result.id,
            type: 'EMAIL_VERIFICATION',
          },
        });
        if (this.configService.get<string>('NODE_ENV') !== 'production') {
          console.log(`[DEV ONLY] Сгенерирован токен: ${token}`);
        }
        return {
          id: result.id,
          email: result.email,
          displayName: result.displayName,
        };
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException('Почта занята');
        }
      }
      throw err;
    }
  }

  async verifyEmail(token: string) {
    const hash = this.hashService.sha256(token);
    const oneTimeToken = await this.prismaService.oneTimeToken.findUnique({
      where: { tokenHash: hash },
    });

    if (
      !oneTimeToken ||
      oneTimeToken.type !== 'EMAIL_VERIFICATION' ||
      oneTimeToken.expiresAt < new Date() ||
      oneTimeToken.usedAt !== null
    ) {
      throw new UnauthorizedException('Неверные данные');
    }
    await this.prismaService.oneTimeToken.update({
      where: { tokenHash: hash },
      data: {
        usedAt: new Date(),
      },
    });
    await this.prismaService.user.update({
      where: { id: oneTimeToken.userId },
      data: {
        isEmailVerified: true,
      },
    });

    return true;
  }

  async login(
    loginDto: LoginDto,
    ip: string,
    userAgent?: string,
    deviceId?: string,
  ) {
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

    const anotherSession = !!deviceId
      ? await this.prismaService.session.findFirst({
          where: { userId: user.id, deviceId, revokedAt: null },
        })
      : undefined;

    if (anotherSession?.id && deviceId) {
      const { accessToken, refreshToken } = await this.tokenService.getTokens({
        userId: user.id,
        sessionId: anotherSession.id,
      });
      const hashToken = await this.hashService.hash(refreshToken);
      await this.prismaService.session.update({
        where: { id: anotherSession.id },
        data: {
          refreshTokenHash: hashToken,
          lastSeenAt: new Date(),
          ip,
          userAgent,
        },
      });

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        accessToken,
        refreshToken,
      };
    } else {
      const sessionId = randomUUID();
      const { accessToken, refreshToken } = await this.tokenService.getTokens({
        userId: user.id,
        sessionId,
      });

      const hashToken = await this.hashService.hash(refreshToken);
      await this.prismaService.session.create({
        data: {
          userId: user.id,
          ip,
          userAgent,
          refreshTokenHash: hashToken,
          lastSeenAt: new Date(),
          deviceId,
          id: sessionId,
        },
      });

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        accessToken,
        refreshToken,
      };
    }
  }

  async refresh(refreshToken: string, ip: string, userAgent?: string) {
    const { session, userId, sessionId } =
      await this.resolveSessionByRefreshToken(refreshToken);

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

  async logout(refreshToken: string) {
    const { sessionId } = await this.resolveSessionByRefreshToken(refreshToken);

    await this.prismaService.session.update({
      where: { id: sessionId },
      data: {
        revokedAt: new Date(),
      },
    });

    return true;
  }

  async logoutAll(refreshToken: string) {
    const { userId } = await this.resolveSessionByRefreshToken(refreshToken);

    await this.prismaService.session.updateMany({
      where: { userId: userId, revokedAt: null },
      data: {
        revokedAt: new Date(),
      },
    });

    return true;
  }

  async forgotPassword(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user?.id) {
      return true;
    }

    await this.prismaService.oneTimeToken.updateMany({
      where: { userId: user.id, type: 'PASSWORD_RESET', usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = this.tokenService.generateToken();
    const hash = this.hashService.sha256(token);

    await this.prismaService.oneTimeToken.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 15 * 60),
        type: 'PASSWORD_RESET',
        tokenHash: hash,
      },
    });

    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      console.log(`[DEV ONLY] Сгенерирован токен: ${token}`);
    }

    return true;
  }

  async resetPassword(token: string, password: string) {
    const hash = this.hashService.sha256(token);
    const passwordHash = await this.hashService.hash(password);

    return await this.prismaService.$transaction(async (prisma) => {
      const updatedToken = await prisma.oneTimeToken.updateMany({
        where: {
          tokenHash: hash,
          usedAt: null,
          type: 'PASSWORD_RESET',
          expiresAt: { gt: new Date() },
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (updatedToken.count === 0) {
        throw new UnauthorizedException('Неверные данные');
      }

      const oneTimeToken = await prisma.oneTimeToken.findUnique({
        where: { tokenHash: hash },
        select: { userId: true },
      });

      if (!oneTimeToken?.userId) {
        throw new UnauthorizedException('Неверные данные');
      }

      await prisma.user.updateMany({
        where: { id: oneTimeToken.userId },
        data: {
          passwordHash,
        },
      });

      await prisma.session.updateMany({
        where: { userId: oneTimeToken.userId, revokedAt: null },
        data: {
          revokedAt: new Date(),
        },
      });

      return true;
    });
  }

  private async resolveSessionByRefreshToken(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    if (!payload || !payload.userId || !payload.sessionId) {
      throw new UnauthorizedException('Неверные данные');
    }

    const { userId, sessionId } = payload;

    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId || !!session.revokedAt) {
      throw new UnauthorizedException('Неверные данные');
    }

    const isRightToken = await this.hashService.verify(
      refreshToken,
      session?.refreshTokenHash,
    );

    if (!isRightToken) {
      throw new UnauthorizedException('Неверные данные');
    }

    return { session, userId, sessionId };
  }
}
