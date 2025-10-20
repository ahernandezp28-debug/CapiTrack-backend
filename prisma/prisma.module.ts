import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Esto es clave para poder usar PrismaService fuera
})
export class PrismaModule {}

