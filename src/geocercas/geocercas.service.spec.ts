import { Test, TestingModule } from '@nestjs/testing';
import { GeocercasService } from './geocercas.service';

describe('GeocercasService', () => {
  let service: GeocercasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeocercasService],
    }).compile();

    service = module.get<GeocercasService>(GeocercasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
