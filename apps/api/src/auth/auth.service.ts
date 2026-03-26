import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/database/prisma.service';
import { HashService } from './hash.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private hashService: HashService,
  ) {}
  async create(createAuthDto: RegisterDto) {
    const email = createAuthDto.email.trim().toLowerCase();

    await this.prismaService.user
      .findUnique({ where: { email } })
      .then((user) => {
        if (user?.email) {
          throw new Error('Почта занята');
        }
      });

    const password = await this.hashService.hashPassword(
      createAuthDto.password,
    );

    const result = await this.prismaService.user
      .create({
        data: {
          email,
          passwordHash: password,
          displayName: createAuthDto.displayName,
        },
      })
      .catch((err) => {
        if (err.code === 'P2002') {
          throw new Error('Почта занята');
        }
      });

    return result;
  }
}
