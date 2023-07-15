import { Test, type TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LogInfo } from 'src/entities/loginfo.entity';
import { UsersService } from 'src/user/user.service';

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repositoryMock: Repository<LogInfo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: getRepositoryToken(LogInfo), useValue: {} }]
    })
      .useMocker(token => {
        if (token === UsersService)
          return {
            /**
             * Mock UsersService here
             */
          };
      })
      .compile();

    service = module.get<AuthService>(AuthService);
    repositoryMock = module.get(getRepositoryToken(LogInfo));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
