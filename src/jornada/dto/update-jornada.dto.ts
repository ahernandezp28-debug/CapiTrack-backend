import { PartialType } from '@nestjs/mapped-types';
import { IniciarJornadaDto } from './iniciar-jornada.dto';
import { IsDateString } from 'class-validator';

export class UpdateJornadaDto extends PartialType(IniciarJornadaDto) {
  @IsDateString()
  fecha_fin?: string; // Solo admin
}

