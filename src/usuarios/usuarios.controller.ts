import {
  Controller,
  Get,
  UseGuards,
  Req,
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

    if (authUser?.email) {
      appUser = await this.prisma.usuario.findUnique({
        where: { correo: authUser.email },
        select: {
          usuario_id: true,
          nombre: true,
          correo: true,
          rol_id: true,
          estado: true,
        },
      });
    }

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
        rol_id: 2,    // Rol operador
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
