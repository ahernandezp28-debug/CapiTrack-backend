import { Test, TestingModule } from '@nestjs/testing';
import { CombustibleService } from './combustible.service';

describe('CombustibleService', () => {
  let service: CombustibleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CombustibleService],
    }).compile();

    service = module.get<CombustibleService>(CombustibleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
