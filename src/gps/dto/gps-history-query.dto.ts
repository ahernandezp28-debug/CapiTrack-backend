// src/gps/dto/gps-history-query.dto.ts
import { IsDateString, IsInt, IsOptional, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class GpsHistoryQueryDto {
  @Type(() => Number)
  @IsInt()
  unidadId: number;

  @IsOptional()
  @IsDateString()
  desde?: string; // ISO string

  @IsOptional()
  @IsDateString()
  hasta?: string; // ISO string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  limit?: number;
}
