// src/jornada/dto/finalizar-jornada.dto.ts
import { IsInt, IsOptional, IsNumber } from 'class-validator';

export class FinalizarJornadaDto {
  @IsInt()
  unidad_id: number;

  // Solo maquinaria
  @IsOptional()
  @IsNumber()
  horometro_fin?: number;
}
