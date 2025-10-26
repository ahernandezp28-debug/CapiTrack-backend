import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateJornadaDto {
  @IsInt()
  @IsNotEmpty()
  unidad_id: number;
}

