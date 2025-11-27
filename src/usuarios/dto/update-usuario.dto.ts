// src/usuarios/dto/update-usuario.dto.ts
import { IsEmail, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rol_id?: number;
}


