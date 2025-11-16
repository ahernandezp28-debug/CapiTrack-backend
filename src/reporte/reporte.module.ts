// src/reporte/reporte.module.ts
import { Module } from '@nestjs/common';
import { ReporteController } from './reporte.controller';
import { ReporteService } from './reporte.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ReporteController],
  providers: [ReporteService, PrismaService],
})
export class ReporteModule {}
