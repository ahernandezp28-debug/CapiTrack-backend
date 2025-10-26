import {
  Controller, Post, Body, Param, Patch, Delete, ParseIntPipe, Req,
  Get, UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import { ReportesService } from './reporte.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { Request } from 'express';

@UseGuards(FirebaseAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: CreateReporteDto) {
    return this.reportesService.create(dto, req['dbUser']);
  }

  @Get()
  async findAll(@Req() req: Request) {
    return this.reportesService.findAll(req['dbUser']);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.reportesService.findOne(id, req['dbUser']);
  }

  @Patch(':id')
  async update(@Req() req: Request, @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReporteDto) {
    return this.reportesService.update(id, dto, req['dbUser']);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.reportesService.remove(id, req['dbUser']);
  }
}

