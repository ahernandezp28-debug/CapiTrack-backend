import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del proveedor es obligatorio' })
  nombre: string;

  @IsOptional()
  @IsString()
  contacto?: string;
}

