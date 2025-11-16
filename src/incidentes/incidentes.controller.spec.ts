import { Test, TestingModule } from '@nestjs/testing';
import { IncidenteController } from './incidentes.controller';
import { IncidenteService } from './incidentes.service';

describe('IncidentesController', () => {
  let controller: IncidenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidenteController],
      providers: [IncidenteService],
    }).compile();

    controller = module.get<IncidenteController>(IncidenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
