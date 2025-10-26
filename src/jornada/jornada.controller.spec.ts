import { Test, TestingModule } from '@nestjs/testing';
import { JornadasController } from './jornada.controller';
import { JornadasService } from './jornada.service';

describe('JornadaController', () => {
  let controller: JornadasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JornadasController],
      providers: [JornadasService],
    }).compile();

    controller = module.get<JornadasController>(JornadasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
