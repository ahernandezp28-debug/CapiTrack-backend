import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  ParseIntPipe, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { Request } from 'express';

@UseGuards(FirebaseAuthGuard)
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: CreateServicioDto) {
    const data = await this.serviciosService.create(dto, req['dbUser']);
    return { message: '✅ Servicio registrado', data };
  }

  @Get()
  async findAll(@Req() req: Request) {
    const data = await this.serviciosService.findAll(req['dbUser']);
    return { total: data.length, data };
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const data = await this.serviciosService.findOne(id, req['dbUser']);
    return { data };
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicioDto,
  ) {
    const data = await this.serviciosService.update(id, dto, req['dbUser']);
    return { message: '✅ Servicio actualizado', data };
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const data = await this.serviciosService.remove(id, req['dbUser']);
    return { message: '🗑️ Servicio eliminado', data };
  }
}

