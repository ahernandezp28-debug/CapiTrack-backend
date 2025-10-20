import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUnidadDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  placa?: string;

  // ============================================================
  // Normaliza y valida tipo de combustible
  // ============================================================
  @Transform(({ value }) => {
    if (!value) return value;
    const clean = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const mapping: Record<string, string> = {
      diesel: 'Diésel',
      disel: 'Diésel',
      gasolina: 'Gasolina',
      electrico: 'Eléctrico',
      electrica: 'Eléctrico',
      hibrido: 'Híbrido',
      hibrida: 'Híbrido',
    };

    return mapping[clean] || value;
  })
  @IsIn(['Diésel', 'Gasolina', 'Eléctrico', 'Híbrido'], {
    message:
      'El tipo de combustible debe ser uno de: Diésel, Gasolina, Eléctrico, Híbrido',
  })
  @IsOptional()
  tipo_combustible?: string;

  // ============================================================
  // Normaliza y valida estado de la unidad
  // ============================================================
  @Transform(({ value }) => {
    if (!value) return value;
    const clean = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const mapping: Record<string, string> = {
      activo: 'Activo',
      activa: 'Activo',
      mantenimiento: 'En mantenimiento',
      'en mantenimiento': 'En mantenimiento',
      fuera: 'Fuera de servicio',
      'fuera de servicio': 'Fuera de servicio',
      inactivo: 'Fuera de servicio',
      descompuesto: 'Fuera de servicio',
    };

    return mapping[clean] || value;
  })
  @IsIn(['Activo', 'En mantenimiento', 'Fuera de servicio'], {
    message:
      'El estado debe ser uno de: Activo, En mantenimiento, Fuera de servicio',
  })
  @IsOptional()
  estado?: string;

  // ============================================================
  // Relaciones opcionales
  // ============================================================
  @ValidateIf((o) => o.proveedor_id !== undefined)
  @IsNumber()
  @IsOptional()
  proveedor_id?: number;

  @ValidateIf((o) => o.usuario_operador_id !== undefined)
  @IsNumber()
  @IsOptional()
  usuario_operador_id?: number;
}
