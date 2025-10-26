import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GeocercasService } from './geocercas.service';
import { CreateGeocercaDto } from './dto/create-geocerca.dto';
import { UpdateGeocercaDto } from './dto/update-geocerca.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('geocercas')
export class GeocercasController {
  constructor(private readonly svc: GeocercasService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateGeocercaDto) {
    return this.svc.create(dto, req['dbUser']);
  }

  @Get()
  findAll(@Req() req) {
    return this.svc.findAll(req['dbUser']);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id, req['dbUser']);
  }

  @Patch(':id')
  update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGeocercaDto) {
    return this.svc.update(id, dto, req['dbUser']);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id, req['dbUser']);
  }
}
