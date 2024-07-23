import {
  BadRequestException,
  Inject,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCodeDto } from './dto/create-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';
import { Code } from './entities/code.entity';
import { classToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { FindCodeDto } from './dto/find-code.dto';
import { RateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { ClientKafka, MessagePattern } from '@nestjs/microservices';
import { S3ClientService } from '../s3/s3-client.service';
import * as Redis from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CodeService {
  private redisClient: Redis.Redis;

  EXTENSION_MAP = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    csharp: 'cs',
    go: 'go',
    ruby: 'rb',
    swift: 'swift',
    kotlin: 'kt',
    rust: 'rs',
    scala: 'scala',
    php: 'php',
    perl: 'pl',
    r: 'r',
    bash: 'sh',
    powershell: 'ps1',
    plaintext: 'txt',
  };

  constructor(
    @InjectRepository(Code)
    private codeRepository: Repository<Code>,
    private readonly s3: S3ClientService,
    @Inject('REDIS_CLIENT') private redis: Redis.Redis,
    @Inject('KAFKA_CLIENT') private client: ClientKafka,
  ) {
    this.redisClient = redis;
  }

  private generateCustomHash(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  private async isCustomIdCached(customId: string): Promise<boolean> {
    const exists = await this.redisClient.exists(customId);
    return exists === 1;
  }

  private async cacheCustomId(
    customId: string,
    expirationSeconds = 3600,
  ): Promise<void> {
    await this.redisClient.setex(customId, expirationSeconds, 'cached');
  }

  public async generateUniqueCustomId(): Promise<string> {
    const idLenght = 6;
    let customId = this.generateCustomHash(idLenght);
    let isCustomIdExist =
      (await this.codeRepository.findOne({
        where: { shortid: customId },
      })) || (await this.isCustomIdCached(customId));

    let attemptCount = 20;
    while (
      (isCustomIdExist || (await this.isCustomIdCached(customId))) &&
      attemptCount > 0
    ) {
      customId = this.generateCustomHash(idLenght);
      isCustomIdExist = await this.codeRepository.findOne({
        where: { shortid: customId },
      });
      attemptCount--;
    }

    if (attemptCount === 0) {
      for (let i = idLenght; i < 10; i++) {
        customId = this.generateCustomHash(i);
        isCustomIdExist = await this.codeRepository.findOne({
          where: { shortid: customId },
        });
        if (!isCustomIdExist) {
          break;
        }
      }
    }

    await this.cacheCustomId(customId);
    return customId;
  }

  // For future code for example downloads by password
  @MessagePattern('find_one_and_validate')
  async findOneAndValidate(
    shortid: string,
    findCodeDto: FindCodeDto,
  ): Promise<Record<string, any>> {
    const codeMeta = await this.codeRepository.findOne({ where: { shortid } });
    if (!codeMeta) {
      throw new BadRequestException({
        errorCode: 'CODE_NOT_FOUND',
        errorMessage: 'Code not found',
        details: {},
      });
    }
    if (codeMeta.viewPassword) {
      if (!findCodeDto.viewPassword) {
        throw new BadRequestException({
          errorCode: 'VIEW_PASSWORD_NOT_SET',
          errorMessage: 'View password not set',
          details: {},
        });
      }
      const isViewPasswordValid = await bcrypt.compareSync(
        findCodeDto.viewPassword,
        codeMeta.viewPassword,
      );
      if (!isViewPasswordValid) {
        throw new BadRequestException({
          errorCode: 'INVALID_PASSWORD',
          errorMessage: 'Invalid view password',
          details: {},
        });
      }
    }
    const code = await this.s3.getFile(codeMeta.s3);
    return classToPlain({ ...codeMeta, code });
  }

  // Limit rate of files uploaded to 10 per minute
  @UseGuards(RateLimitMiddleware)
  @MessagePattern('create')
  async create(createCodeDto: CreateCodeDto): Promise<Code> {
    const newCode = this.codeRepository.create(createCodeDto);
    const codeSize = Buffer.from(createCodeDto.code).length;

    if (codeSize > 10 * 1024 * 1024) {
      // 10 MB
      throw new BadRequestException({
        errorCode: 'CODE_SIZE_EXCEEDED',
        errorMessage: 'Code size exceeds 10 MB',
        details: {},
      });
    }
    newCode.timeAdded = new Date();
    newCode.timeExpired = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000); // 31 days
    if (newCode.viewPassword === '') {
      newCode.viewPassword = null;
    }
    if (newCode.editPassword === '') {
      newCode.editPassword = null;
    }
    if (newCode.viewPassword) {
      newCode.viewPassword = await bcrypt.hashSync(newCode.viewPassword, 10);
    }
    if (newCode.editPassword) {
      newCode.editPassword = await bcrypt.hashSync(newCode.editPassword, 10);
    }

    const extension = this.EXTENSION_MAP[newCode.language];

    const s3Key = await this.s3.uploadFile(
      extension,
      Buffer.from(createCodeDto.code),
    );

    const customId = await this.generateUniqueCustomId();

    newCode.shortid = customId;
    newCode.s3 = s3Key;

    await this.codeRepository.save(newCode);

    const code = new Code();
    code.shortid = newCode.shortid;
    code.language = newCode.language;
    code.timeAdded = newCode.timeAdded;
    code.timeExpired = newCode.timeExpired;
    return code;
  }

  @MessagePattern('find_one')
  async findOne(shortid: string, findCodeDto: FindCodeDto): Promise<any> {
    return await this.findOneAndValidate(shortid, findCodeDto);
  }

  @MessagePattern('update')
  async update(shortid: string, updateCodeDto: UpdateCodeDto) {
    const code = await this.codeRepository.findOne({ where: { shortid } });
    if (!code) {
      throw new BadRequestException({
        errorCode: 'CODE_NOT_FOUND',
        errorMessage: 'Code not found',
        details: {},
      });
    }
    if (!code.editPassword) {
      // Edit password is required to update code
      throw new BadRequestException({
        errorCode: 'EDIT_PASSWORD_NOT_SET',
        errorMessage: 'Edit password not set',
        details: {},
      });
    }
    const isEditPasswordValid = await bcrypt.compareSync(
      updateCodeDto.updatePassword,
      code.editPassword,
    );
    if (!isEditPasswordValid) {
      throw new BadRequestException({
        errorCode: 'INVALID_PASSWORD',
        errorMessage: 'Invalid edit password',
        details: {},
      });
    }
    const codeSize = Buffer.from(updateCodeDto.code).length;
    if (codeSize > 10 * 1024 * 1024) {
      // 10 MB
      throw new BadRequestException({
        errorCode: 'CODE_SIZE_EXCEEDED',
        errorMessage: 'Code size exceeds 10 MB',
        details: {},
      });
    }

    await this.codeRepository.save(code);
    return code;
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM) // Run every day to delete expired codes and meta from the database
  async removeExpiredCodes() {
    const now = new Date();
    const expiredCodes = await this.codeRepository
      .createQueryBuilder()
      .where('timetodeleate < :now', { now })
      .getMany();

    for (const code of expiredCodes) {
      await this.codeRepository.remove(code);
      await this.s3.deleteFile(code.s3);
    }
  }
}
