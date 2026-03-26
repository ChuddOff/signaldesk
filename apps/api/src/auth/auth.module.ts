import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/database/prisma.service';
import { HashService } from './hash.service';

@Module({
  imports: [PrismaService, HashService],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
