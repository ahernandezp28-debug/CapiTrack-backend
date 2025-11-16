// src/unidades/dto/update-unidade.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUnidadDto } from './create-unidade.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateUnidadDto extends PartialType(CreateUnidadDto) {
  @IsOptional()
  @IsNumber()
  costo_hora?: number;
}
