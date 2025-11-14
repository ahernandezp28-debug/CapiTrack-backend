import { IsString, IsOptional, IsInt } from "class-validator";

export class CreateUnidadDto {

  @IsString()
  nombre: string;

  @IsString()
  tipo: string;

  @IsString()
  tipo_combustible: string;

  @IsString()
  estado: string;

  @IsOptional()
  @IsInt()
  proveedor_id?: number;

  @IsOptional()
  @IsInt()
  usuario_operador_id?: number;

  @IsOptional()
  @IsString()
  placa?: string;
}

