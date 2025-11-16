// src/incidente/incidente.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { IncidenteService } from './incidentes.service';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('incidentes')
@UseGuards(FirebaseAuthGuard)
export class IncidenteController {
  constructor(private readonly incidenteService: IncidenteService) {}

  // POST /incidentes  (operador reporta)
  @Post()
  async create(@Body() dto: CreateIncidenteDto, @Req() req: any) {
    return this.incidenteService.create(dto, req.user);
  }

  // GET /incidentes  (admin / encargado / operador)
  @Get()
  async findAll(@Req() req: any) {
    return this.incidenteService.findAll(req.user);
  }
}
