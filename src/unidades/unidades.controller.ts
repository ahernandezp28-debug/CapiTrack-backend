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
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { UnidadesService } from './unidades.service';
import { CreateUnidadDto } from './dto/create-unidade.dto';
import { UpdateUnidadDto } from './dto/update-unidade.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { Request } from 'express';

@UseGuards(FirebaseAuthGuard)
@Controller('unidades')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  // ======================================================
  // 🟢 Crear unidad
  // Solo Admins (rol_id = 1) y Encargados (rol_id = 4)
  // ======================================================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() createUnidadDto: CreateUnidadDto) {
    const user = req['dbUser'];

    if (![1, 4].includes(user.rol_id)) {
      throw new ForbiddenException('Solo administradores o encargados pueden crear unidades');
    }

    const nueva = await this.unidadesService.create(createUnidadDto, user);
    return {
      statusCode: HttpStatus.CREATED,
      message: '✅ Unidad creada correctamente',
      data: nueva,
    };
  }

  // ======================================================
  // 🔵 Obtener todas las unidades
  // Admin ve todas, encargado ve las suyas, operador ve las asignadas
  // Se puede filtrar por proveedor o estado
  // ======================================================
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Req() req: Request,
    @Query('proveedor') proveedor?: string,
    @Query('estado') estado?: string,
  ) {
    const unidades = await this.unidadesService.findAll(req['dbUser']);

    // Filtros opcionales
    const filtradas = unidades.filter((u) => {
      const matchProveedor = proveedor ? u.proveedor_id === Number(proveedor) : true;
      const matchEstado = estado ? u.estado === estado : true;
      return matchProveedor && matchEstado;
    });

    return {
      statusCode: HttpStatus.OK,
      message: '✅ Lista de unidades obtenida correctamente',
      total: filtradas.length,
      data: filtradas,
    };
  }

  // ======================================================
  // 🟣 Obtener una unidad específica
  // ======================================================
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const unidad = await this.unidadesService.findOne(id, req['dbUser']);
    return {
      statusCode: HttpStatus.OK,
      message: '✅ Unidad encontrada',
      data: unidad,
    };
  }

  // ======================================================
  // 🟠 Actualizar una unidad
  // Solo admin y encargado (solo sus proveedores)
  // ======================================================
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnidadDto: UpdateUnidadDto,
  ) {
    const user = req['dbUser'];
    if (![1, 4].includes(user.rol_id)) {
      throw new ForbiddenException('Solo administradores o encargados pueden modificar unidades');
    }

    const actualizada = await this.unidadesService.update(id, updateUnidadDto, user);
    return {
      statusCode: HttpStatus.OK,
      message: '✅ Unidad actualizada correctamente',
      data: actualizada,
    };
  }

  // ======================================================
  // 🔴 Eliminar una unidad
  // Solo admin
  // ======================================================
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req['dbUser'];

    if (user.rol_id !== 1) {
      throw new ForbiddenException('Solo los administradores pueden eliminar unidades');
    }

    const eliminada = await this.unidadesService.remove(id, user);
    return {
      statusCode: HttpStatus.OK,
      message: '🗑️ Unidad eliminada correctamente',
      data: eliminada,
    };
  }
}
