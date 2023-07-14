import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogInfo } from 'src/entities/loginfo.entity';
import { Repository } from 'typeorm';

/**
 *
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(LogInfo)
    private loginInfoRepository: Repository<LogInfo>
  ) {}
}
