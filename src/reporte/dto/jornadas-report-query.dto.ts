import { IsOptional, IsInt, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class JornadasReportQueryDto {
  @IsOptional()
  @IsDateString()
  desde?: string; // yyyy-mm-dd

  @IsOptional()
  @IsDateString()
  hasta?: string; // yyyy-mm-dd

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  proveedor_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  unidad_id?: number;

  @IsOptional()
  @IsIn(['CAMION', 'MAQUINARIA'])
  tipo_unidad?: string; // CAMION / MAQUINARIA
}
