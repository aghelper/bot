import { Test, TestingModule } from '@nestjs/testing';
import { ListCmdService } from './list.service';

describe('ListCmdService', () => {
  let service: ListCmdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListCmdService],
    }).compile();

    service = module.get<ListCmdService>(ListCmdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
