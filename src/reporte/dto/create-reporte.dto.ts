import { IsString, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateReporteDto {
  @IsString()
  tipo: string;

  @IsDateString()
  fecha: string;

  @IsDateString()
  hora_inicio: string;

  @IsDateString()
  hora_fin: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  horas_trabajadas?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsNumber()
  unidad_id: number;
}

