import { Test, TestingModule } from '@nestjs/testing';
import { IncidenteService } from './incidentes.service';

describe('IncidentesService', () => {
  let service: IncidenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncidenteService],
    }).compile();

    service = module.get<IncidenteService>(IncidenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
