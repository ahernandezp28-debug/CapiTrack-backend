import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';

export class CreateCombustibleDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsNumber()
  @IsPositive()
  cantidad: number;

  @IsNumber()
  @IsPositive()
  costo_total: number;

  @IsNumber()
  @IsNotEmpty()
  unidad_id: number;
}
