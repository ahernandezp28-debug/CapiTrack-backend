import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHello() {
    const usuarios = await this.prisma.usuario.findMany();
    return { message: '✅ CapiTrack Backend funcionando', usuarios };
  }
}
