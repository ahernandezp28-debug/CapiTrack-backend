import { IsNotEmpty, IsString, IsNumber, IsIn } from 'class-validator';

export class CreateGeocercaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  unidad_id: number;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;

  @IsNumber()
  radio_metros: number;

  @IsString()
  @IsIn(['ENTRADA', 'SALIDA', 'AMBOS'])
  tipo_evento: 'ENTRADA' | 'SALIDA' | 'AMBOS';
}


