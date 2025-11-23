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

  /**
   * Inicia una jornada para la unidad asignada al operador autenticado.
   * - Para MAQUINARIA requiere dto.horometro_inicio
   * - Para CAMION no requiere horómetro
   */
  async iniciarJornada(dto: IniciarJornadaDto, authEmail?: string | null) {
    const operador = await this.getOperadorByEmail(authEmail);

    const unidad = await this.prisma.unidad.findUnique({
      where: { unidad_id: dto.unidad_id },
    });

    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }

    // Verificar que la unidad esté asignada al operador que intenta iniciar
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
    const tipo = (unidad.tipo ?? '').toString().toUpperCase();

    // costo_hora: preferimos el definido en la unidad (si existe), si no, 0
    const costoHora =
      typeof unidad.costo_hora === 'number'
        ? unidad.costo_hora
        : Number(unidad.costo_hora ?? 0);

    // horómetro inicio puede ser número o null
    let horometroInicio: number | null = null;

    if (tipo === 'MAQUINARIA') {
      if (dto.horometro_inicio == null) {
        throw new BadRequestException(
          'Debe indicar horómetro inicial para maquinaria',
        );
      }
      horometroInicio = Number(dto.horometro_inicio);
    }

    // Crear la jornada. Para camión dejamos inicio_jornada; para maquinaria
    // guardamos horometro_inicio y dejamos inicio_jornada null (opcional).
    const creada = await this.prisma.jornada.create({
      data: {
        fecha: now,
        unidad_id: unidad.unidad_id,
        operador_id: operador.usuario_id,
        // Para CAMION: inicio_jornada registra hora de inicio
        inicio_jornada: tipo === 'MAQUINARIA' ? null : now,
        // Para MAQUINARIA: guardamos horometro_inicio
        horometro_inicio: horometroInicio,
        // fin_jornada y horometro_fin quedan en null hasta finalizar
        fin_jornada: null,
        horometro_fin: null,
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

  /**
   * Finaliza la jornada activa de la unidad para el operador autenticado.
   * - Para MAQUINARIA requiere dto.horometro_fin
   * - Para CAMION se calcula por tiempo entre inicio_jornada y ahora
   */
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

    // Buscamos la jornada activa (fin_jornada === null)
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
    const tipo = (unidad.tipo ?? '').toString().toUpperCase();

    // Determinar costo_hora: preferimos el de la jornada (si ya tenía), si no el de la unidad
    const costoHora =
      typeof jornada.costo_hora === 'number'
        ? jornada.costo_hora
        : typeof unidad.costo_hora === 'number'
        ? unidad.costo_hora
        : Number(unidad.costo_hora ?? 0);

    let horas = 0;
    let horometroFinToSave: number | null = null;

    if (tipo === 'MAQUINARIA') {
      // Validaciones específicas
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
      const fin = Number(dto.horometro_fin);

      if (fin < inicio) {
        throw new BadRequestException(
          'El horómetro final no puede ser menor al inicial',
        );
      }

      // Horas calculadas como diferencia de horómetro (puede ser decimal)
      horas = Number((fin - inicio).toFixed(2));
      horometroFinToSave = fin;
    } else {
      // CAMIÓN (por tiempo)
      if (!jornada.inicio_jornada) {
        throw new BadRequestException(
          'La jornada no tiene hora de inicio registrada',
        );
      }
      // inicio_jornada existe aquí (comprobado arriba), TS no se queja ahora
      const diffMs = now.getTime() - jornada.inicio_jornada.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);
      horas = Number(diffHoras.toFixed(2));
    }

    const totalPagar = Number((horas * Number(costoHora)).toFixed(2));

    // Actualizamos la jornada: IMPORTANTÍSIMO setear fin_jornada para "cerrarla"
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

  // Obtener jornada activa para una unidad (usa solo fin_jornada === null)
  async getJornadaActiva(unidad_id: number) {
    return await this.prisma.jornada.findFirst({
      where: {
        unidad_id,
        fin_jornada: null,
      },
    });
  }
}
