// src/gps/gps.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GpsService } from "./gps.service";
import { CreateGpsReportDto } from "./dto/create-gps-report.dto";
import { GpsHistoryQueryDto } from "./dto/gps-history-query.dto";
// Ajusta estos imports a tus guards reales
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";

@Controller("gps")
@UseGuards(FirebaseAuthGuard) // si quieres permitir sin login, puedes quitar esto
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  /**
   * POST /gps/report
   * Body:
   * {
   *   "unidad_id": 1,
   *   "latitud": 14.63,
   *   "longitud": -90.50,
   *   "velocidad": 35.4
   * }
   */
  @Post("report")
  async report(@Body() dto: CreateGpsReportDto) {
    const created = await this.gpsService.createReport(dto);
    return { ok: true, gps: created };
  }

  /**
   * GET /gps/ultimas
   * GET /gps/ultimas?unidadId=1
   */
  @Get("ultimas")
  async ultimas(@Query("unidadId") unidadId?: string) {
    const list = await this.gpsService.getUltimas(
      unidadId ? Number(unidadId) : undefined,
    );
    return { ok: true, data: list };
  }

  /**
   * GET /gps/historial?unidadId=1&desde=2025-11-01T00:00:00.000Z&hasta=2025-11-14T23:59:59.999Z&limit=500
   */
  @Get("historial")
  async historial(@Query() query: GpsHistoryQueryDto) {
    const data = await this.gpsService.getHistory(query);
    return { ok: true, data };
  }
}
