// src/gps/dto/create-gps-report.dto.ts
import { IsInt, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateGpsReportDto {
  @Type(() => Number)
  @IsInt()
  unidad_id: number;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;

  @IsOptional()
  @IsNumber()
  velocidad?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ultima_geocerca_id?: number;
}
