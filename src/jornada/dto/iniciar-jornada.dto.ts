// src/jornada/dto/iniciar-jornada.dto.ts
import { IsInt, IsOptional, IsNumber } from 'class-validator';

export class IniciarJornadaDto {
  @IsInt()
  unidad_id: number;

  // Solo para MAQUINARIA
  @IsOptional()
  @IsNumber()
  horometro_inicio?: number;
}
