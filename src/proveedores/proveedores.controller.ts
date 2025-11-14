import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedore.dto';
import { UpdateProveedorDto } from './dto/update-proveedore.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

@UseGuards(FirebaseAuthGuard) // 👈 SOLO Firebase por ahora
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Get()
  findAll() {
    return this.proveedoresService.findAll();
  }

  @Post()
  // @Roles(1)   // 👈 desactivado temporalmente
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedorDto);
  }

  @Patch(':id')
  // @Roles(1)
  update(
    @Param('id') id: string,
    @Body() updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedoresService.update(+id, updateProveedorDto);
  }

  @Delete(':id')
  // @Roles(1)
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(+id);
  }
}
