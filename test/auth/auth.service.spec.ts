import { Test, type TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Credentials } from 'src/entities/credentials.entity';
import { UsersService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repositoryMock: Repository<Credentials>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: getRepositoryToken(Credentials), useValue: {} }]
    })
      .useMocker(token => {
        if (token === UsersService)
          return {
            /**
             * Mock UsersService here
             */
          };
        else if (token === JwtService)
          return {
            /**
             * Mock JWTService here
             */
          }
        else if (token === CACHE_MANAGER)
          return {
            /**
             * Mock CacheManager here
             */
          }
      })
      .compile();

    service = module.get<AuthService>(AuthService);
    repositoryMock = module.get(getRepositoryToken(Credentials));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
