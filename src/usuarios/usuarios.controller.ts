import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  ParseIntPipe, Req, UseGuards, Query, ForbiddenException,
  NotFoundException, BadRequestException, HttpCode, HttpStatus
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';

@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Solo administradores pueden crear usuarios
  @Roles(1)
  @Post()
  async create(@Req() req: Request, @Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto, req['dbUser']);
  }

  // Todos los autenticados pueden ver lista
  @Get()
  async findAll(@Query('page') page = '1', @Query('limit') limit = '20', @Query('q') q?: string) {
    return this.usuariosService.findAll({ page: Number(page), limit: Number(limit), q });
  }

  // Ver un usuario por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  // Admin puede editar cualquier usuario; usuarios normales, solo su propio perfil
  @Patch(':id')
  async update(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, dto, req['dbUser']);
  }

  // Solo administradores pueden eliminar
  @Roles(1)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id, req['dbUser']);
  }

  // Ver perfil propio
  @Get('profile/me')
  async getProfile(@Req() req: Request) {
    return req['dbUser'];
  }
}
