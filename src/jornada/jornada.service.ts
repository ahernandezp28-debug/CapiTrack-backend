// src/jornada/jornada.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IniciarJornadaDto } from './dto/iniciar-jornada.dto';
import { FinalizarJornadaDto } from './dto/finalizar-jornada.dto';

@Injectable()
export class JornadaService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOperadorByEmail(email?: string | null) {
    if (!email) {
      throw new UnauthorizedException('No se encontró email autenticado');
    }

    const usuario = await this.prisma.usuario.findFirst({
      where: { correo: email },
    });

    if (!usuario) {
      throw new UnauthorizedException(
        'Usuario de aplicación no encontrado para este email',
      );
    }

    if (usuario.rol_id !== 2) {
      throw new ForbiddenException(
        'Solo los operadores pueden gestionar jornadas desde la app',
      );
    }

    return usuario;
  }

  async iniciarJornada(dto: IniciarJornadaDto, authEmail?: string | null) {
    const operador = await this.getOperadorByEmail(authEmail);

    const unidad = await this.prisma.unidad.findUnique({
      where: { unidad_id: dto.unidad_id },
    });

    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }

    if (unidad.usuario_operador_id !== operador.usuario_id) {
      throw new ForbiddenException(
        'Esta unidad no está asignada a este operador',
      );
    }

    // ¿Ya hay una jornada activa para esta unidad/operador?
    const jornadaActiva = await this.prisma.jornada.findFirst({
      where: {
        unidad_id: unidad.unidad_id,
        operador_id: operador.usuario_id,
        fin_jornada: null,
      },
    });

    if (jornadaActiva) {
      throw new BadRequestException(
        'Ya existe una jornada activa para esta unidad',
      );
    }

    const now = new Date();
    const tipo = (unidad.tipo ?? '').toUpperCase();
    const costoHora = typeof unidad.costo_hora === 'number' ? unidad.costo_hora : 0;

    let horometroInicio: number | null = null;

    if (tipo === 'MAQUINARIA') {
      if (dto.horometro_inicio == null) {
        throw new BadRequestException(
          'Debe indicar horómetro inicial para maquinaria',
        );
      }
      horometroInicio = dto.horometro_inicio;
    }

    const creada = await this.prisma.jornada.create({
      data: {
        fecha: now,
        unidad_id: unidad.unidad_id,
        operador_id: operador.usuario_id,
        inicio_jornada: now,
        horometro_inicio: horometroInicio,
        costo_hora: costoHora,
      },
    });

    return {
      ok: true,
      jornada_id: creada.jornada_id,
      fecha: creada.fecha,
      unidad_id: creada.unidad_id,
      operador_id: creada.operador_id,
    };
  }

  async finalizarJornada(dto: FinalizarJornadaDto, authEmail?: string | null) {
    const operador = await this.getOperadorByEmail(authEmail);

    const unidad = await this.prisma.unidad.findUnique({
      where: { unidad_id: dto.unidad_id },
    });

    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }

    if (unidad.usuario_operador_id !== operador.usuario_id) {
      throw new ForbiddenException(
        'Esta unidad no está asignada a este operador',
      );
    }

    const jornada = await this.prisma.jornada.findFirst({
      where: {
        unidad_id: unidad.unidad_id,
        operador_id: operador.usuario_id,
        fin_jornada: null,
      },
    });

    if (!jornada) {
      throw new BadRequestException('No hay jornada activa para esta unidad');
    }

    const now = new Date();
    const tipo = (unidad.tipo ?? '').toUpperCase();
    const costoHora = typeof jornada.costo_hora === 'number'
      ? jornada.costo_hora
      : typeof unidad.costo_hora === 'number'
      ? unidad.costo_hora
      : 0;

    let horas = 0;
    let horometroFinToSave: number | null = jornada.horometro_fin as any;

    if (tipo === 'MAQUINARIA') {
      if (dto.horometro_fin == null) {
        throw new BadRequestException(
          'Debe indicar horómetro final para maquinaria',
        );
      }
      if (jornada.horometro_inicio == null) {
        throw new BadRequestException(
          'La jornada no tiene horómetro inicial registrado',
        );
      }

      const inicio = Number(jornada.horometro_inicio);
      const fin = dto.horometro_fin;
      const diff = fin - inicio;

      if (diff < 0) {
        throw new BadRequestException(
          'El horómetro final no puede ser menor al inicial',
        );
      }

      horas = Number(diff.toFixed(2));
      horometroFinToSave = fin;
    } else {
      if (!jornada.inicio_jornada) {
        throw new BadRequestException(
          'La jornada no tiene hora de inicio registrada',
        );
      }
      const diffMs = now.getTime() - jornada.inicio_jornada.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);
      horas = Number(diffHoras.toFixed(2));
    }

    const totalPagar = Number((horas * costoHora).toFixed(2));

    const actualizada = await this.prisma.jornada.update({
      where: { jornada_id: jornada.jornada_id },
      data: {
        fin_jornada: now,
        horometro_fin: horometroFinToSave,
        total_horas: horas,
        total_pagar: totalPagar,
      },
    });

    return {
      ok: true,
      jornada_id: actualizada.jornada_id,
      total_horas: actualizada.total_horas,
      total_pagar: actualizada.total_pagar,
    };
  }
}
