import { Test, TestingModule } from '@nestjs/testing';
import { CombustibleController } from './combustible.controller';
import { CombustibleService } from './combustible.service';

describe('CombustibleController', () => {
  let controller: CombustibleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CombustibleController],
      providers: [CombustibleService],
    }).compile();

    controller = module.get<CombustibleController>(CombustibleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
