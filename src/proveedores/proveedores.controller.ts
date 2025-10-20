import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedore.dto';
import { UpdateProveedorDto } from './dto/update-proveedore.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { Request } from 'express';

@UseGuards(FirebaseAuthGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: CreateProveedorDto) {
    const nuevo = await this.proveedoresService.create(dto, req['dbUser']);
    return { message: '✅ Proveedor creado correctamente', data: nuevo };
  }

  @Get()
  async findAll(@Req() req: Request) {
    const proveedores = await this.proveedoresService.findAll(req['dbUser']);
    return { total: proveedores.length, data: proveedores };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const proveedor = await this.proveedoresService.findOne(id);
    return { data: proveedor };
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProveedorDto,
  ) {
    const actualizado = await this.proveedoresService.update(id, dto, req['dbUser']);
    return { message: '✅ Proveedor actualizado correctamente', data: actualizado };
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const eliminado = await this.proveedoresService.remove(id, req['dbUser']);
    return { message: '🗑️ Proveedor eliminado correctamente', data: eliminado };
  }
}
