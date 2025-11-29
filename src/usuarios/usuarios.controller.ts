// src/usuarios/usuarios.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
  ConflictException,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

// Tipo flexible para DELETE (acepta { usuario_id } o { id })
type DeleteBody = { usuario_id?: number; id?: number };

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private prisma: PrismaService,
    private usuariosService: UsuariosService,
  ) {}

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/me')
  async me(@Req() req: any) {
    const authUser = req.user;
    if (!authUser?.email) {
      throw new NotFoundException('No se encontró el email del usuario autenticado');
    }

    const user = await this.prisma.usuario.findUnique({
      where: { correo: authUser.email },
      include: { unidades: true },
    });

    if (!user) throw new NotFoundException('Usuario interno no encontrado');

    const unidadAsignada = user.unidades[0] ?? null;

    return {
      ok: true,
      auth: authUser ?? null,
      appUser: {
        usuario_id: user.usuario_id,
        nombre: user.nombre,
        correo: user.correo,
        rol_id: user.rol_id,
        estado: user.estado,
        unidadAsignadaId: unidadAsignada?.unidad_id ?? null,
        unidadNombre: unidadAsignada?.nombre ?? null,
      },
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('operadores')
  async operadores() {
    return { ok: true, data: await this.usuariosService.findOperadores() };
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('admins')
  async admins() {
    return { ok: true, data: await this.usuariosService.findAdmins() };
  }

  @UseGuards(FirebaseAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
    @Req() req: any,
  ) {
    const requesterEmail =
      req?.user?.email ??
      req?.user?.correo ??
      req?.user?.decodedToken?.email ??
      null;

    if (!requesterEmail) {
      throw new BadRequestException('No se detectó usuario autenticado.');
    }

    const updated = await this.usuariosService.updateUsuario(id, dto, requesterEmail);
    return { ok: true, data: updated };
  }

  // ----------------- NEW: DELETE /usuarios/:id -----------------
  @UseGuards(FirebaseAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const requesterEmail =
      req?.user?.email ??
      req?.user?.correo ??
      req?.user?.decodedToken?.email ??
      null;

    if (!requesterEmail) {
      throw new BadRequestException('No se detectó usuario autenticado.');
    }

    try {
      const deleted = await this.usuariosService.deleteUsuario(id, requesterEmail);
      return { ok: true, deleted };
    } catch (err: any) {
      // Prisma error codes y Postgres
      // P2003 = foreign key constraint failed in Prisma (Postgres 23503 similar)
      // P2025 = Record to delete does not exist
      if (err?.code === 'P2003' || err?.code === '23503') {
        throw new ConflictException('El usuario tiene registros relacionados. Elimina dependencias primero o usa soft-delete.');
      }
      if (err?.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      // fallback: volver a lanzar (será 500)
      throw err;
    }
  }

  // Mantener compatibilidad: POST /usuarios/delete
  @UseGuards(FirebaseAuthGuard)
  @Post('delete')
  async removePost(@Body() body: DeleteBody, @Req() req: any) {
    const usuario_id = Number(body?.usuario_id ?? body?.id ?? 0);
    if (!usuario_id || isNaN(usuario_id)) {
      throw new BadRequestException('usuario_id inválido');
    }

    const requesterEmail =
      req?.user?.email ??
      req?.user?.correo ??
      req?.user?.decodedToken?.email ??
      null;

    if (!requesterEmail) {
      throw new BadRequestException('No se detectó usuario autenticado.');
    }

    try {
      const deleted = await this.usuariosService.deleteUsuario(usuario_id, requesterEmail);
      return { ok: true, deleted };
    } catch (err: any) {
      if (err?.code === 'P2003' || err?.code === '23503') {
        throw new ConflictException('El usuario tiene registros relacionados. Elimina dependencias primero o usa soft-delete.');
      }
      if (err?.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw err;
    }
  }
}
