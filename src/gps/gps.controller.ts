// File: src/gps/gps.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GpsService } from './gps.service';
import { CreateGpsReportDto } from './dto/create-gps-report.dto';
import { GpsHistoryQueryDto } from './dto/gps-history-query.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('gps')
@UseGuards(FirebaseAuthGuard)
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post('report')
  async report(@Body() dto: CreateGpsReportDto) {
    const created = await this.gpsService.createReport(dto);
    return { ok: true, gps: created };
  }

  @Get('ultimos')
  async ultimos(@Query('unidadId') unidadId?: string) {
    const data = await this.gpsService.getUltimos(
      unidadId ? Number(unidadId) : undefined,
    );
    return { ok: true, data };
  }

  @Get('historial')
  async historial(@Query() query: GpsHistoryQueryDto) {
    const data = await this.gpsService.getHistory(query);
    return { ok: true, data };
  }
}

