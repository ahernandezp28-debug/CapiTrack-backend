import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CombustibleService } from './combustible.service';
import { CreateCombustibleDto } from './dto/create-combustible.dto';
import { UpdateCombustibleDto } from './dto/update-combustible.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { Request } from 'express';

@UseGuards(FirebaseAuthGuard)
@Controller('combustibles')
export class CombustibleController {
  constructor(private readonly combustibleService: CombustibleService) {}

  // ======================================================
  // 🟢 Crear registro de combustible
  // ======================================================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() createCombustibleDto: CreateCombustibleDto) {
    const nuevo = await this.combustibleService.create(createCombustibleDto, req['dbUser']);
    return {
      message: '✅ Registro de combustible creado correctamente',
      data: nuevo,
    };
  }

  // ======================================================
  // 🔵 Obtener todos los registros
  // ======================================================
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() req: Request) {
    const registros = await this.combustibleService.findAll(req['dbUser']);
    return {
      message: '✅ Lista de registros obtenida correctamente',
      total: registros.length,
      data: registros,
    };
  }

  // ======================================================
  // 🟣 Obtener un registro específico
  // ======================================================
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const registro = await this.combustibleService.findOne(id, req['dbUser']);
    return {
      message: '✅ Registro encontrado',
      data: registro,
    };
  }

  // ======================================================
  // 🟠 Actualizar un registro
  // ======================================================
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCombustibleDto: UpdateCombustibleDto,
  ) {
    const actualizado = await this.combustibleService.update(id, updateCombustibleDto, req['dbUser']);
    return {
      message: '✅ Registro actualizado correctamente',
      data: actualizado,
    };
  }

  // ======================================================
  // 🔴 Eliminar un registro
  // ======================================================
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const eliminado = await this.combustibleService.remove(id, req['dbUser']);
    return {
      message: '🗑️ Registro eliminado correctamente',
      data: eliminado,
    };
  }
}
