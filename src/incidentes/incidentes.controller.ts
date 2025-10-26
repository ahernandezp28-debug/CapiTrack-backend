import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  Req, ParseIntPipe, UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { Request } from 'express';

@UseGuards(FirebaseAuthGuard)
@Controller('incidentes')
export class IncidentesController {
  constructor(private readonly incidentesService: IncidentesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: Request, @Body() dto: CreateIncidenteDto) {
    return this.incidentesService.create(dto, req['dbUser']);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.incidentesService.findAll(req['dbUser']);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.incidentesService.findOne(id, req['dbUser']);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncidenteDto) {
    return this.incidentesService.update(id, dto, req['dbUser']);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.incidentesService.remove(id, req['dbUser']);
  }
}
