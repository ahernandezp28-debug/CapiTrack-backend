import { Test, TestingModule } from '@nestjs/testing';
import { GeocercasController } from './geocercas.controller';
import { GeocercasService } from './geocercas.service';

describe('GeocercasController', () => {
  let controller: GeocercasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeocercasController],
      providers: [GeocercasService],
    }).compile();

    controller = module.get<GeocercasController>(GeocercasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
