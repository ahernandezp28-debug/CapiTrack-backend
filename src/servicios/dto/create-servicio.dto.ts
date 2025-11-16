import { IsNotEmpty, IsString, IsInt } from "class-validator";

export class CreateServicioDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  descripcion: string;

  @IsInt()
  unidad_id: number;
}
