import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { Request } from 'express';

@UseGuards(FirebaseAuthGuard)
@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateAlertaDto) {
    return this.alertasService.create(dto, req['dbUser']);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.alertasService.findAll(req['dbUser']);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.alertasService.findOne(id, req['dbUser']);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAlertaDto) {
    return this.alertasService.update(id, dto, req['dbUser']);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.alertasService.remove(id, req['dbUser']);
  }
}

