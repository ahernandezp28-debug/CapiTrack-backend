// src/gps/dto/create-gp.dto.ts
export class CreateGpsDto {
  unidad_id: number;
  latitud: number;
  longitud: number;
  velocidad?: number;
  ultima_geocerca_id?: number;
}


