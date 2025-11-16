// src/reporte/reporte.controller.ts
import {
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReporteService } from './reporte.service';
import { JornadasReportQueryDto } from './dto/jornadas-report-query.dto';

@Controller('reportes') // 👈 PLURAL: /reportes/...
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  // Lista JSON para el dashboard
  @Get('jornadas')
  async jornadas(@Query() query: JornadasReportQueryDto) {
    return this.reporteService.jornadasResumen(query);
  }

  // Descarga Excel
  @Get('jornadas/excel')
  async jornadasExcel(
    @Query() query: JornadasReportQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reporteService.exportJornadasExcel(query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte_jornadas.xlsx"',
    );

    res.end(buffer);
  }
}
