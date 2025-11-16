// src/jornada/dto/iniciar-jornada.dto.ts
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class IniciarJornadaDto {
  @IsInt()
  unidad_id: number;

  // Solo se usa para MAQUINARIA
  @IsOptional()
  @IsNumber()
  @Min(0)
  horometro_inicio?: number;
}
