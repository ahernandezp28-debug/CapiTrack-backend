// src/servicio/servicio.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ServicioService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('servicios')
@UseGuards(FirebaseAuthGuard)
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  // POST /servicios  (operador solicita servicio)
  @Post()
  async create(@Body() dto: CreateServicioDto, @Req() req: any) {
    // 👈 MUY IMPORTANTE: solo le pasamos req.user
    return this.servicioService.create(dto, req.user);
  }

  // GET /servicios  (admin / encargado / operador)
  @Get()
  async findAll(@Req() req: any) {
    // 👈 IGUAL: solo req.user
    return this.servicioService.findAll(req.user);
  }
}

