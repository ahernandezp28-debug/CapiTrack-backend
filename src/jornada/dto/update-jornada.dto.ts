import { PartialType } from '@nestjs/mapped-types';
import { CreateJornadaDto } from './create-jornada.dto';
import { IsDateString } from 'class-validator';

export class UpdateJornadaDto extends PartialType(CreateJornadaDto) {
  @IsDateString()
  fecha_fin?: string; // Solo admin
}

