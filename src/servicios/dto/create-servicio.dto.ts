import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServicioDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsInt()
  unidad_id: number;
}

