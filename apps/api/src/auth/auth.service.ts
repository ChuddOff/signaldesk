import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/database/prisma.service';
import { HashService } from './hash.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private hashService: HashService,
  ) {}
  async register(createAuthDto: RegisterDto) {
    const email = createAuthDto.email.trim().toLowerCase();

    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (user?.email) {
      throw new ConflictException('Почта занята');
    }

    const password = await this.hashService.hashPassword(
      createAuthDto.password,
    );

    try {
      const result = await this.prismaService.user.create({
        data: {
          email,
          passwordHash: password,
          displayName: createAuthDto.displayName.trim(),
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
}
