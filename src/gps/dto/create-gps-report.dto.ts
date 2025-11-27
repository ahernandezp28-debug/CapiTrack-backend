import { IsInt, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateGpsReportDto {
  @Type(() => Number)
  @IsInt()
  unidad_id: number;

  @Type(() => Number)
  @IsNumber()
  latitud: number;

  @Type(() => Number)
  @IsNumber()
  longitud: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  velocidad?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ultima_geocerca_id?: number;
}

