import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateIncidenteDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  severidad: string;

  @IsInt()
  unidad_id: number;
}
