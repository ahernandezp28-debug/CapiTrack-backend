import { IsString, IsOptional, IsInt, IsIn, IsNotEmpty, IsNumber } from "class-validator";

export class CreateUnidadDto {

   @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsIn(["CAMION", "MAQUINARIA"])
  tipo: string;

  @IsString()
  @IsIn(["DIESEL", "GASOLINA", "ELECTRICO", "OTROS"])
  tipo_combustible: string;

  @IsString()
  estado: string;

  @IsOptional()
  @IsInt()
  proveedor_id?: number;

  @IsOptional()
  @IsInt()
  usuario_operador_id?: number;

    // ⬇️ NUEVO
  @IsNumber()
  costo_hora: number;

  @IsOptional()
  @IsString()
  placa?: string;
}

