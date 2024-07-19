import {BadRequestException, Injectable, UseGuards} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateCodeDto} from './dto/create-code.dto';
import {UpdateCodeDto} from './dto/update-code.dto';
import {Code} from './entities/code.entity';
import {classToPlain} from "class-transformer";
import bcrypt from 'bcrypt';
import {FindCodeDto} from "./dto/find-code.dto";
import {Cron, CronExpression} from "@nestjs/schedule";
import {RateLimitMiddleware} from "../middleware/rate-limit.middleware";

@Injectable()
export class CodeService {
  constructor(
      @InjectRepository(Code)
      private codeRepository: Repository<Code>,
  ) {}

  async findOneAndValidate(id: number, findCodeDto: FindCodeDto): Promise<Record<string, any>> {
    const code = await this.codeRepository.findOne({ where: { id } });
    if (!code) {
      throw new Error('Code not found');
    }
    if (code.viewPassword) {
      const isViewPasswordValid = await bcrypt.compare(findCodeDto.viewPassword, code.viewPassword);
      if (!isViewPasswordValid) {
        throw new Error('Invalid view password');
      }
    }
    return classToPlain(code);
  }

  // Limit rate of files uploaded to 10 per minute
  @UseGuards(RateLimitMiddleware)
  async create(createCodeDto: CreateCodeDto): Promise<Code> {
    const newCode = this.codeRepository.create(createCodeDto);
    const codeSize = Buffer.from(createCodeDto.code).length;
    if (codeSize > 10 * 1024 * 1024) { // 10 MB
      throw new BadRequestException('Code size exceeds 10 MB');
    }
    newCode.timeAdded = new Date();
    newCode.timeExpired = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    if (newCode.viewPassword === '') {
      newCode.viewPassword = null;
    }
    if (newCode.editPassword === '') {
      newCode.editPassword = null;
    }
    if (newCode.viewPassword) {
      newCode.viewPassword = await bcrypt.hash(newCode.viewPassword, 10);
    }
    if (newCode.editPassword) {
      newCode.editPassword = await bcrypt.hash(newCode.editPassword, 10);
    }
    await this.codeRepository.save(newCode);
    return newCode;
  }

  async findOne(id: number, findCodeDto: FindCodeDto): Promise<any> {
    return await this.findOneAndValidate(id, findCodeDto);
  }

  async update(id: number, updateCodeDto: UpdateCodeDto) {
    const code = await this.codeRepository.findOne({ where: { id } });
    if (!code) {
      throw new Error('Code not found');
    }
    if (!code.editPassword) throw new Error('Edit password not set'); // Edit password is required to update code
    const isEditPasswordValid = await bcrypt.compare(updateCodeDto.updatePassword, code.editPassword);
    if (!isEditPasswordValid) {
      throw new Error('Invalid edit password');
    }
    const codeSize = Buffer.from(updateCodeDto.code).length;
    if (codeSize > 10 * 1024 * 1024) { // 10 MB
      throw new BadRequestException('Code size exceeds 10 MB');
    }
    code.code = updateCodeDto.code;
    await this.codeRepository.save(code);
    return code;
  }

@Cron(CronExpression.EVERY_HOUR)// Run every hour to delete expired codes from the database
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
