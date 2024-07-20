import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCodeDto } from './dto/create-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';
import { Code } from './entities/code.entity';
import { classToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { FindCodeDto } from './dto/find-code.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RateLimitMiddleware } from '../middleware/rate-limit.middleware';

@Injectable()
export class CodeService {
  constructor(
    @InjectRepository(Code)
    private codeRepository: Repository<Code>,
  ) {}

  // For future code for example downloads by password
  async findOneAndValidate(
    id: number,
    findCodeDto: FindCodeDto,
  ): Promise<Record<string, any>> {
    const code = await this.codeRepository.findOne({ where: { id } });
    if (!code) {
      throw new BadRequestException({
        errorCode: 'CODE_NOT_FOUND',
        errorMessage: 'Code not found',
        details: {},
      });
    }
    if (code.viewPassword) {
      if (!findCodeDto.viewPassword) {
        throw new BadRequestException({
          errorCode: 'VIEW_PASSWORD_NOT_SET',
          errorMessage: 'View password not set',
          details: {},
        });
      }
      const isViewPasswordValid = await bcrypt.compareSync(
        findCodeDto.viewPassword,
        code.viewPassword,
      );
      if (!isViewPasswordValid) {
        throw new BadRequestException({
          errorCode: 'INVALID_PASSWORD',
          errorMessage: 'Invalid view password',
          details: {},
        });
      }
    }
    return classToPlain(code);
  }

  // Limit rate of files uploaded to 10 per minute
  @UseGuards(RateLimitMiddleware)
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
    newCode.timeExpired = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    if (newCode.viewPassword === '') {
      newCode.viewPassword = null;
    }
    if (newCode.editPassword === '') {
      newCode.editPassword = null;
    }
    console.log(newCode);
    if (newCode.viewPassword) {
      newCode.viewPassword = await bcrypt.hashSync(newCode.viewPassword, 10);
    }
    if (newCode.editPassword) {
      newCode.editPassword = await bcrypt.hashSync(newCode.editPassword, 10);
    }
    await this.codeRepository.save(newCode);

    const code = new Code();
    code.id = newCode.id;
    code.code = newCode.code;
    code.language = newCode.language;
    code.timeAdded = newCode.timeAdded;
    code.timeExpired = newCode.timeExpired;

    return code;
  }

  async findOne(id: number, findCodeDto: FindCodeDto): Promise<any> {
    return await this.findOneAndValidate(id, findCodeDto);
  }

  async update(id: number, updateCodeDto: UpdateCodeDto) {
    const code = await this.codeRepository.findOne({ where: { id } });
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
    code.code = updateCodeDto.code;
    await this.codeRepository.save(code);
    return code;
  }

  @Cron(CronExpression.EVERY_HOUR) // Run every hour to delete expired codes from the database
  async removeExpiredCodes() {
    const now = new Date();
    const expiredCodes = await this.codeRepository
      .createQueryBuilder()
      .where('timetodeleate < :now', { now })
      .getMany();

    for (const code of expiredCodes) {
      await this.codeRepository.remove(code);
    }
  }
}
