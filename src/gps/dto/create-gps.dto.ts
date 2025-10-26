import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGpsDto {
  @IsNumber()
  @IsNotEmpty()
  latitud: number;

  @IsNumber()
  @IsNotEmpty()
  longitud: number;

  @IsNumber()
  @IsOptional()
  velocidad?: number;

  @IsNumber()
  @IsNotEmpty()
  unidad_id: number;
}

