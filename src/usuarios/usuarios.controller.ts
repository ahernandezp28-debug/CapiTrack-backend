import {
  Controller,
  Get,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private prisma: PrismaService) {}

  // 🔐 Perfil del usuario autenticado
  @UseGuards(FirebaseAuthGuard)
  @Get('profile/me')
  async me(@Req() req: Request) {
    const authUser = (req as any).user; // viene del guard (uid, email, etc.)
    let appUser: any | null = null;

    if (!authUser?.email) {
      throw new NotFoundException(
        'No se encontró el email en el usuario autenticado',
      );
    }

    // Buscamos al usuario interno por correo
    const user = await this.prisma.usuario.findUnique({
      where: { correo: authUser.email },
      include: {
        // incluimos las unidades relacionadas (OperadorUnidad)
        unidades: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario interno no encontrado');
    }

    // Tomamos la primera unidad asignada (puedes manejar varias más adelante)
    const unidadAsignada = user.unidades[0] ?? null;

    appUser = {
      usuario_id: user.usuario_id,
      nombre: user.nombre,
      correo: user.correo,
      rol_id: user.rol_id,
      estado: user.estado,
      unidadAsignadaId: unidadAsignada?.unidad_id ?? null,
      unidadNombre: unidadAsignada?.nombre ?? null,
    };

    return {
      ok: true,
      auth: authUser ?? null,
      appUser,
    };
  }

  // 👷‍♂️ Listado de operadores (rol_id = 2, estado = true)
  // GET /usuarios/operadores
  @UseGuards(FirebaseAuthGuard)
  @Get('operadores')
  async getOperadores() {
    const operadores = await this.prisma.usuario.findMany({
      where: {
        rol_id: 2, // Rol operador
        estado: true, // Solo activos
      },
      select: {
        usuario_id: true,
        nombre: true,
        correo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return {
      ok: true,
      total: operadores.length,
      data: operadores,
    };
  }
}
