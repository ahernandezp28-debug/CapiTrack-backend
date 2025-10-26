import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateAlertaDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @IsString()
  @IsNotEmpty()
  prioridad: string;

  @IsInt()
  unidad_id: number;
}

